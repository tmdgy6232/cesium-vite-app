import React, { useRef, useContext, useState, useEffect } from 'react';
import { Viewer, Entity, ScreenSpaceEventHandler, ScreenSpaceEvent, Camera, Scene } from 'resium';
import * as Cesium from 'cesium';
import { DefaultContext } from '../context/DefaultContext';
import { getCentroidCartesian, moveCentroidToCoordinate, checkDistance, checkDistanceEllipsoid } from '../utils/calculate';
const ViewerComponent = ({ clickedPositions, setClickedPositions, selectedPolygon, setSelectedPolygon }) => {
  const { buttonsState } = useContext(DefaultContext);
  const viewerRef = useRef();
  const [centroidEntity, setCentroidEntity] = useState();
  // 초기위치 세팅로직
  useEffect(() => {
    let intervalId;
  
    const checkViewerReady = () => {
      const viewer = viewerRef.current?.cesiumElement;
  
      if (viewer) {
        clearInterval(intervalId);
          viewer.scene.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(2435, -4638.142451189, 3000000),
            orientation: {
              heading: Cesium.Math.toRadians(0),
              pitch: Cesium.Math.toRadians(-90),
              roll: 0.0
            }
          });
      }
    };
  
    // 일정 간격으로 viewerRef를 확인
    intervalId = setInterval(checkViewerReady, 100);
  
    return () => clearInterval(intervalId);
  }, []);
  
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
        console.log('selectedPolygon')
        console.log(selectedPolygon)
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
     
      
      // const centroid = Cesium.BoundingSphere.fromPoints(pickedObject.id.polygon.hierarchy.getValue().positions).center;
      const positions = pickedObject.id.polygon.hierarchy.getValue().positions;
      // 함수로 계산하기
      const centroid = getCentroidCartesian(positions);

      // 거리계산
      const distance = checkDistance(positions[0], positions[1]);
      const distance1 = checkDistanceEllipsoid(positions[0], positions[1]);

      // 중심점 셋팅
      // setCentroidEntity(() => 
      // <Entity position={centroid} point={{ pixelSize: 10, color: Cesium.Color.YELLOW }} />)

      // 도형이동
      const movePositions = moveCentroidToCoordinate(positions, 0, 0, 0) 
      const moveDistance = checkDistance(movePositions[0], movePositions[1]);
      const moveDistance1 = checkDistanceEllipsoid(movePositions[0], movePositions[1]);

      console.log(`직선 이동 전 거리: ${distance} 미터, 이동 후 거리: ${moveDistance} 미터`);
      console.log(`곡률 이동 전 거리: ${distance1} 미터, 이동 후 거리: ${moveDistance1} 미터`);
      
      setClickedPositions(movePositions);
      setSelectedPolygon(movePositions)
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
    console.log('init')
    moveCameraToOrigin();
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

// 카메라 이동 함수
const moveCameraToOrigin = () => {
  const viewer = viewerRef.current.cesiumElement;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(0, 0, 3000000), // fromDegrees(longitude, latitude, height)랑 new Cartesian3(x, y, z)랑 좌표가 다름 뭔차이야
    orientation: {
      heading: Cesium.Math.toRadians(0),  // 북쪽을 향함
      pitch: Cesium.Math.toRadians(-90),  // 아래쪽을 바라봄
      roll: 0.0                           // 롤 없음
    },
    duration: 2  // 2초 동안 이동
  });
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
      <Entity
          position={Cesium.Cartesian3.fromDegrees(0, 0, 0)}
          point={{ pixelSize: 10, color: Cesium.Color.RED }}
        />
      {/* {centroidEntity} */}
      {/* 클릭된 좌표들에 대한 위치와 텍스트 표시 */}
      {buttonsState.showXYZ && clickedPositions.map(renderXYZEntity)}

      {/* 클릭된 좌표들에 대한 인덱스 표시 */}
      {buttonsState.showIndex && clickedPositions.map(renderIndexEntity)}
    </Viewer>
  );
};

export default ViewerComponent;
