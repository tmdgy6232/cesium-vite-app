import React, { useState, useEffect, useRef } from 'react';
import { Viewer, Entity, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
import * as Cesium from 'cesium';

const App = () => {
  const [polygonPosition, setPolygonPosition] = useState([
    Cesium.Cartesian3.fromDegrees(-100.0, 40.0),
    Cesium.Cartesian3.fromDegrees(-105.0, 40.0),
    Cesium.Cartesian3.fromDegrees(-105.0, 35.0),
    Cesium.Cartesian3.fromDegrees(-100.0, 35.0),
  ]); // 초기 폴리곤 좌표들
  const [isClickEnabled, setIsClickEnabled] = useState(false);
  const viewerRef = useRef();

  useEffect(() => {
    const addButtonToToolbar = () => {
      const toolbar = document.querySelector('.cesium-viewer-toolbar');
      if (toolbar && !toolbar.querySelector('#click-toggle-button')) {
        const button = document.createElement('button');
        button.id = 'click-toggle-button';
        button.textContent = isClickEnabled ? 'Disable Move' : 'Enable Move';
        button.style = 'margin-right: 10px;';
        toolbar.appendChild(button);

        // 버튼 클릭 시 클릭 활성화 상태를 토글
        button.addEventListener('click', () => {
          setIsClickEnabled((prev) => !prev);
          button.textContent = !isClickEnabled ? 'Disable Move' : 'Enable Move';
        });
      }
    };

    const timeoutId = setTimeout(addButtonToToolbar, 1000);

    return () => {
      clearTimeout(timeoutId);
      const toolbar = document.querySelector('.cesium-viewer-toolbar');
      const button = document.querySelector('#click-toggle-button');
      if (toolbar && button) {
        toolbar.removeChild(button);
      }
    };
  }, [isClickEnabled]);

  // 폴리곤을 이동시키는 클릭 이벤트 핸들러
  const handleLeftClick = (event) => {
    if (!isClickEnabled) return;

    const scene = viewerRef.current.cesiumElement.scene;
    const cartesian = scene.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);

    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);

      // 기존의 다각형 위치를 새로운 위치로 이동
      setPolygonPosition((prev) => {
        const deltaLat = latitude - Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(prev[0]).latitude);
        const deltaLon = longitude - Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(prev[0]).longitude);

        return prev.map((pos) => {
          const cartoPos = Cesium.Cartographic.fromCartesian(pos);
          const newLat = Cesium.Math.toDegrees(cartoPos.latitude) + deltaLat;
          const newLon = Cesium.Math.toDegrees(cartoPos.longitude) + deltaLon;
          return Cesium.Cartesian3.fromDegrees(newLon, newLat);
        });
      });
    }
  };

  return (
    <Viewer ref={viewerRef} full>
      {/* 화면에서 발생하는 마우스 클릭 이벤트 처리 */}
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent action={handleLeftClick} type={Cesium.ScreenSpaceEventType.LEFT_CLICK} />
      </ScreenSpaceEventHandler>

      {/* 폴리곤 표시 및 좌표 이동 */}
      <Entity
        polygon={{
          hierarchy: new Cesium.PolygonHierarchy(polygonPosition),
          material: Cesium.Color.BLUE.withAlpha(0.5),
        }}
      />
    </Viewer>
  );
};

export default App;