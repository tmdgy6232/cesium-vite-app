import React, { useState, useEffect, useRef } from 'react';
import { Viewer, Entity, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
import * as Cesium from 'cesium';

const App = () => {
  const [clickedPosition, setClickedPosition] = useState([]);
  const [isClickEnabled, setIsClickEnabled] = useState(false);
  const viewerRef = useRef();

  useEffect(() => {
    const addButtonToToolbar = () => {
      const toolbar = document.querySelector('.cesium-viewer-toolbar');
      if (toolbar && !toolbar.querySelector('#click-toggle-button')) {
        const button = document.createElement('button');
        button.id = 'click-toggle-button';
        button.textContent = isClickEnabled ? 'Disable Click' : 'Enable Click';
        button.style = 'margin-right: 10px;';
        toolbar.appendChild(button);

        button.addEventListener('click', () => {
          setIsClickEnabled((prev) => !prev);
          button.textContent = !isClickEnabled ? 'Disable Click' : 'Enable Click';
        });
      }
    };

    const timeoutId = setTimeout(addButtonToToolbar, 1000);
    
    // position 초기화
    setClickedPosition((prev) => []);

    return () => {
      clearTimeout(timeoutId);
      const toolbar = document.querySelector('.cesium-viewer-toolbar');
      const button = document.querySelector('#click-toggle-button');
      if (toolbar && button) {
        toolbar.removeChild(button);
      }
    };
  }, [isClickEnabled]);

  const handleLeftClick = (event) => {
    if (!isClickEnabled) return;

    const scene = viewerRef.current.cesiumElement.scene;
    const cartesian = scene.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);
    
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);

      setClickedPosition((prev) => {
        const newPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
        return [...prev, newPosition];  // 3D 좌표 그대로 저장
      });
    }
  };

  return (
    <Viewer ref={viewerRef} full>
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent action={handleLeftClick} type={Cesium.ScreenSpaceEventType.LEFT_CLICK} />
      </ScreenSpaceEventHandler>

      {/* 저장된 클릭된 위치를 표시 */}
      {clickedPosition.map((position, index) => (
        <Entity
          key={index}
          position={position}  // 이미 저장된 3D 좌표 사용
          point={{ pixelSize: 10, color: Cesium.Color.RED }}
        />
      ))}

       {/* 클릭된 좌표로 폴리곤 그리기 */}
       {clickedPosition.length > 2 && (
        <Entity
          polygon={{
            hierarchy: new Cesium.PolygonHierarchy(clickedPosition),
            material: Cesium.Color.YELLOW.withAlpha(0.5),  // 폴리곤 색과 투명도
          }}
        />
      )}
    </Viewer>
  );
};

export default App;
