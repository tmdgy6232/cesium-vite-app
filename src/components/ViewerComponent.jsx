import React, { useRef, useContext, useState, useEffect } from 'react';
import { Viewer, Entity, ScreenSpaceEventHandler, ScreenSpaceEvent, Camera, Scene } from 'resium';
import * as Cesium from 'cesium';
import { DefaultContext } from '../context/DefaultContext';
import { getCentroidCartesian, moveCentroidToCoordinate, checkDistance, checkDistanceEllipsoid } from '../utils/calculate';
import { apiRequest } from '../utils/apiRequest';
const ViewerComponent = ({ clickedPositions, setClickedPositions, selectedPolygon, setSelectedPolygon }) => {
  const { buttonsState } = useContext(DefaultContext);
  const viewerRef = useRef();
  const [centroidEntity, setCentroidEntity] = useState();
  const [polygonHeight, setPolygonHeight] = useState();
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
      }
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

      console.log(`직선 이동 전 거리: ${distance} 미터, 이동 후 거리: ${moveDistance} 미터, 비교 퍼센티지: ${((moveDistance - distance) / distance) * 100}%`);
      console.log(`곡률 이동 전 거리: ${distance1} 미터, 이동 후 거리: ${moveDistance1} 미터`, `비교 퍼센티지: ${((moveDistance1 - distance1) / distance1) * 100}%`);
      


      setClickedPositions(movePositions);
      setSelectedPolygon(movePositions)
    } else {
      console.log("No polygon selected.");
    }
    
  }

  // 3D로 변환 버튼 클릭 이벤트
  const make3DFunc = (event) => {
    const scene = viewerRef.current.cesiumElement.scene;
    const pickedObject = scene.pick(event.position);
    if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon) {
      // 사용자에게 높이 받기
      const targetHeight = prompt("Enter the height of the 3D object (meters):");

      if (targetHeight === null || isNaN(targetHeight)) {
        alert("Invalid height.");
        return;
      } 
      setPolygonHeight(parseFloat(targetHeight));
    
    // 선택된 폴리곤에 3D 속성 적용
    //pickedObject.id.polygon.extrudedHeight = parseFloat(targetHeight);  // 전체 높이를 적용할 수도 있음
    //pickedObject.id.polygon.hierarchy = new Cesium.PolygonHierarchy(new3DPositions);  
    //pickedObject.id.polygon.perPositionHeight = true;  // 각 좌표의 높이 적용

      
    } else {
      alert("No polygon selected.");
      return;
    }
  }

  // DB 저장 버튼 클릭 이벤트
  const saveDBFunc = (event) => {
    moveCameraToOrigin();
  }

  // DB 불러오기 버튼 클릭 이벤트
  const recallDBFunc = async (event) => {
    // const response = await apiRequest('GET', 'http://localhost:8080/api/getPolygon');
    // console.log(response);

    // 포지션 생성
    const bottomPositions = Cesium.Cartesian3.fromDegreesArrayHeights([
      -72.0, 40.0, 0,
      -70.0, 35.0, 0,
      -75.0, 30.0, 0,
  ]);
  const upperPositions = Cesium.Cartesian3.fromDegreesArrayHeights([
    -72.0, 40.0, 300000,
    -70.0, 35.0, 300000,
    -75.0, 30.0, 300000,
]);

  //polygon geometry 생성
  const bottomPolygon = new Cesium.PolygonGeometry({
    polygonHierarchy: new Cesium.PolygonHierarchy(bottomPositions),
    perPositionHeight: true,
    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT  // Appearance와 맞는 vertexFormat 사용

});
const upperPolygon = new Cesium.PolygonGeometry({
  polygonHierarchy: new Cesium.PolygonHierarchy(upperPositions),
  perPositionHeight: true,
  vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT  // Appearance와 맞는 vertexFormat 사용

});
  // geometry instance 생성
  const bottomGeometryInstance = new Cesium.GeometryInstance({
    geometry: bottomPolygon,
    attributes: {
      color:  Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE)  // 색상 설정
    }
});
  console.log('test')
  const sideGemoetryInstance =  bottomPositions.map((position, index) => {
    const bottom = [position, bottomPositions[(index + 1) % bottomPositions.length]];
    const upper = [upperPositions[index], upperPositions[(index + 1) % upperPositions.length]];
    const side = [bottom[0], upper[0], upper[1], bottom[1], bottom[0]];

    return new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(side),
     perPositionHeight: true,
      vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT  // Appearance와 맞는 vertexFormat 사용

    }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
      }
    });
  })  
const upperGeometryInstance = new Cesium.GeometryInstance({
  geometry: upperPolygon,
  attributes: {
    color:  Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE)  // 색상 설정
  }
});
  // // viewer에 추가
  viewerRef.current.cesiumElement.scene.primitives.add(new Cesium.Primitive({
    geometryInstances: [bottomGeometryInstance, upperGeometryInstance, ...sideGemoetryInstance],
    appearance: new Cesium.PerInstanceColorAppearance(),
  }));
}


 // showXYZ 버튼 클릭 시 좌표 보여주기 엔티티를 추가하는 함수
 const renderXYZEntity = (position, index) => {
  const cartographic = Cesium.Cartographic.fromCartesian(position);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);

  return (
    <Entity
      key={index}
      position={position}
      label={{
        text: `x: ${longitude.toFixed(4)}, y: ${latitude.toFixed(4)}, z: ${cartographic.height.toFixed(4)}
        ecef x: ${position.x.toFixed(4)}, ecef y: ${position.y.toFixed(4)}, ecef z: ${position.z.toFixed(4)}
        `,
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

 // showIndex 버튼 클릭 시 index를 보여주기 엔티티를 추가하는 함수
 const renderIndexEntity = (position, index) => {
  const cartographic = Cesium.Cartographic.fromCartesian(position);

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
            extrudedHeight: polygonHeight ? polygonHeight : undefined,
          }}
        />
      )}
      
      <Entity
          position={Cesium.Cartesian3.fromDegrees(-72.0, 40.0, 0)}
          point={{ pixelSize: 10, color: Cesium.Color.BLUE }}
        />
      <Entity
          position={Cesium.Cartesian3.fromDegrees(-70.0, 35.0, 0)}
          point={{ pixelSize: 10, color: Cesium.Color.RED }}
        />
        <Entity
          position={Cesium.Cartesian3.fromDegrees( -75.0, 30.0, 0)}
          point={{ pixelSize: 10, color: Cesium.Color.PURPLE }}
        />
        <Entity
          position={Cesium.Cartesian3.fromDegrees(-72.0, 40.0, 300000)}
          point={{ pixelSize: 10, color: Cesium.Color.PINK }}
        />
        <Entity
          position={Cesium.Cartesian3.fromDegrees(-70.0, 35.0, 300000)}
          point={{ pixelSize: 10, color: Cesium.Color.YELLOW }}
        />
        <Entity
          position={Cesium.Cartesian3.fromDegrees(-75.0, 30.0, 300000)}
          point={{ pixelSize: 10, color: Cesium.Color.GREEN }}
        />
      {/* {centroidEntity} */}
      {/* 클릭된 좌표들에 대한 위치와 텍스트 표시 */}
      {buttonsState.showXYZ && clickedPositions.map(renderXYZEntity)}
      {buttonsState.showXYZ && renderXYZEntity(Cesium.Cartesian3.fromDegrees(0, 0, 0))}

      {/* 클릭된 좌표들에 대한 인덱스 표시 */}
      {buttonsState.showIndex && clickedPositions.map(renderIndexEntity)}
    </Viewer>
  );
};

export default ViewerComponent;
