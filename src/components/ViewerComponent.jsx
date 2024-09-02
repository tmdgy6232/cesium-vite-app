import React, { useRef, useContext } from 'react';
import { Viewer, Entity, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
import * as Cesium from 'cesium';
import { DefaultContext } from '../context/DefaultContext';
import { getCentroid } from '../calculate';
const ViewerComponent = ({ clickedPositions, setClickedPositions, selectedPolygon, setSelectedPolygon }) => {
  const { buttonsState } = useContext(DefaultContext);
  const viewerRef = useRef();

  const handleLeftClick = (event) => {
    
    if(buttonsState.toggle) {
      toggleClickFunc(event);
    } else if (buttonsState.showXYZ) {
      showXYZFunc(event);
    } else if (buttonsState.showIndex) {  
      showIndexFunc(event);
    } else if (buttonsState.movePolygon) {
      movePolygonFunc(event);

    } else if (buttonsState.saveDB) {
      saveDBFunc(event);
    } else if (buttonsState.make3D) {
      make3DFunc(event);
    } else if (buttonsState.recallDB) {
      recallDBFunc(event);
    }
  };


  // 좌표찍기 버튼 클릭 이벤트
  const toggleClickFunc = (event) => {
    const scene = viewerRef.current.cesiumElement.scene;
    const cartesian = scene.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);
    
    if (cartesian) {
      setClickedPositions((prev) => [...prev, cartesian]);

      // 예시: 폴리곤 생성 또는 업데이트
      if (clickedPositions.length >= 2) {
        setSelectedPolygon([...clickedPositions, cartesian]);
      }
    }
  }
  
  // 위치 좌표값 출력 버튼 클릭 이벤트
  const showXYZFunc = (event) => {
    const scene = viewerRef.current.cesiumElement.scene;
    const cartesian = scene.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);
    
    if (cartesian) {
      console.log("XYZ Coordinates:", cartesian);
    } else {
      console.log("No positions clicked.");
    }
  }

  // 폴리곤 인덱스 출력 버튼 클릭 이벤트
  const showIndexFunc = (event) => {
    const scene = viewerRef.current.cesiumElement.scene;
    const cartesian = scene.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);
    
    if (cartesian) {
      console.log("Polygon Points Index:", clickedPositions);
    } else {
      console.log("No polygon selected.");
    }
  }

  // 폴리곤 이동 버튼 클릭 이벤트
  const movePolygonFunc = (event) => {
    const scene = viewerRef.current.cesiumElement.scene;
    const pickedObject = scene.pick(event.position);
    if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon) {
      console.log(`pickedObject`);
      console.log(pickedObject)
      const centroid = getCentroid([clickedPositions.map(p => p.x), clickedPositions.map(p => p.y)]);
      console.log(centroid)
    } else {
      console.log("No polygon selected.");
    }
    
  }

  // 3D로 변환 버튼 클릭 이벤트
  const make3DFunc = (event) => {
    console.log("3D로 변환");
  }

  // DB 저장 버튼 클릭 이벤트
  const saveDBFunc = (event) => {
    console.log("DB에 저장");
  }

  // DB 불러오기 버튼 클릭 이벤트
  const recallDBFunc = (event) => {
    console.log("DB에서 불러오기");
  }

 // 좌표 보여주기 엔티티를 추가하는 함수
 const renderXYZEntity = (position, index) => {
  const cartographic = Cesium.Cartographic.fromCartesian(position);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);

  return (
    <Entity
      key={index}
      position={position}
      label={{
        text: `x: ${latitude.toFixed(4)}, y: ${longitude.toFixed(4)}`,
        font: '10pt monospace',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -9),
      }}
      point={{ pixelSize: 10, color: Cesium.Color.RED }}
    />
  ); 
};

 // 좌표 보여주기 엔티티를 추가하는 함수
 const renderIndexEntity = (position, index) => {
  const cartographic = Cesium.Cartographic.fromCartesian(position);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);

  return (
    <Entity
      key={index}
      position={position}
      label={{
        text: `${index+1}`,
        font: '14pt monospace',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -9),
      }}
      point={{ pixelSize: 10, color: Cesium.Color.RED }}
    />
  ); 
};

  return (
    <Viewer ref={viewerRef} 
    full={false} 
    style={{width:'100%', height:'80vh'}}
    fullscreenButton={false}
    navigationHelpButton={false}
    homeButton={false}
    sceneModePicker={false}
    timeline={false}
    animation={false}
    geocoder={false}
    vrButton={false}
    baseLayerPicker={false}
    infoBox={false}
    >
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent action={handleLeftClick} type={Cesium.ScreenSpaceEventType.LEFT_CLICK} />
      </ScreenSpaceEventHandler>

      {clickedPositions.map((position, index) => (
        <Entity
          key={index}
          position={position}
          point={{ pixelSize: 10, color: Cesium.Color.RED }}
        />
      ))}

      {selectedPolygon && (
        <Entity
          polygon={{
            hierarchy: selectedPolygon,
            material: Cesium.Color.YELLOW.withAlpha(0.5),
          }}
        />
      )}

      {/* 클릭된 좌표들에 대한 위치와 텍스트 표시 */}
      {buttonsState.showXYZ && clickedPositions.map(renderXYZEntity)}

      {/* 클릭된 좌표들에 대한 인덱스 표시 */}
      {buttonsState.showIndex && clickedPositions.map(renderIndexEntity)}
    </Viewer>
  );
};

export default ViewerComponent;
