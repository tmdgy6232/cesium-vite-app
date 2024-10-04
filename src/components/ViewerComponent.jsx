import React, { useRef, useContext, useState, useEffect } from 'react';
import { Viewer, Entity, ScreenSpaceEventHandler, ScreenSpaceEvent, Camera, Scene, pick, Cesium3DTileset } from 'resium';
import * as Cesium from 'cesium';
import { DefaultContext } from '../context/DefaultContext';
import { getCentroidCartesian, moveCentroidToCoordinate, checkDistance, checkDistanceEllipsoid, convertCartesianToGeographic } from '../utils/calculate';
import { apiRequest } from '../utils/apiRequest';
import CesiumManager from '../utils/CesiumManager';
import PolygonManager from '../utils/PolygonManager';
const ViewerComponent = ({ clickedPositions, setClickedPositions, selectedPolygon, setSelectedPolygon }) => {
  const { buttonsState } = useContext(DefaultContext);
  const viewerRef = useRef();
  const [centroidEntity, setCentroidEntity] = useState();
  const [polygonManager, setPolygonManager] = useState();
  const [cesiumManager, setCesiumManager] = useState();
  const [tileset, setTileset] = useState(null);

  // 초기위치 세팅로직
  useEffect(() => {
    let intervalId;
  
    const checkViewerReady = () => {
      const viewer = viewerRef.current?.cesiumElement;
  
      if (viewer) {
        clearInterval(intervalId);
          // viewer.scene.camera.setView({
          //   destination: Cesium.Cartesian3.fromDegrees(2435, -4638.142451189, 3000000),
          //   orientation: {
          //     heading: Cesium.Math.toRadians(0),
          //     pitch: Cesium.Math.toRadians(-90),
          //     roll: 0.0
          //   }
          // });
          setCesiumManager(new CesiumManager(viewer));
          setPolygonManager(new PolygonManager(viewer));
      }
    };
  
    // 일정 간격으로 viewerRef를 확인
    intervalId = setInterval(checkViewerReady, 100);
  
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if(cesiumManager) {
      cesiumManager.moveCamera();
    }
  }, [cesiumManager])
  
  /** 3d tiles asset 가져오기 예제 */
  // useEffect(() => {
  //   const loadTileset = async () => {
  //     try {
  //       const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2464651); // Cesium ion에서 에셋 ID로 타일셋 로드
  //       setTileset(tileset);
  //       const viewer = cesiumManager.getViewer();
  //       console.log(tileset)
  //       viewer.scene.primitives.add(tileset); // 타일셋을 씬에 추가
  //       viewer.zoomTo(tileset); // 타일셋으로 카메라 이동
  //     } catch (error) {
  //       console.error("타일셋 로드 오류:", error);
  //     }
  //   };

  //   loadTileset();
  // }, [])

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
      // recallDBFunc(event);
      recallDBFunc2(event);
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

    if(!polygonManager) {
      console.log('no polygonManager');
      return;
    }
    const scene = viewerRef.current.cesiumElement.scene;
    const pickedObject = scene.pick(event.position);
    if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.polygon) {
      // 사용자에게 높이 받기
      const targetHeight = prompt("Enter the height of the 3D object (meters):");

      if (targetHeight === null || isNaN(targetHeight)) {
        alert("Invalid height.");
        return;
      } 
      // setPolygonHeight(parseFloat(targetHeight));
      polygonManager.convert3Dpolygon(pickedObject, parseFloat(targetHeight));
      
    } else {
      alert("No polygon selected.");
      return;
    }
  }

  // // DB 저장 버튼 클릭 이벤트
  // const saveDBFunc = (event) => {
  //   const scene = viewerRef.current.cesiumElement.scene;
  //   const pickedObject = scene.pick(event.position);
 
  // // Matrix는 primitives의 geometry를 변환시키는데(이동, 회전, 스케일) 사용됨
  // console.log(cesiumManager.viewer.scene.primitives)
  // const primitive = cesiumManager.viewer.scene.primitives.get(1);
  
  // // matrix는 현재 위치에서의 변환이므로, 현재 위치값에서 계산 필요
  // // 현재 객체의 위치 가져오기
  // const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  // console.log(cartographic)
  // const currentLongitude = Cesium.Math.toDegrees(cartographic.longitude);
  // const currentLatitude = Cesium.Math.toDegrees(cartographic.latitude);
  // const currentHeight = cartographic.height;

  // console.log('현재 위치:', currentLongitude, currentLatitude, currentHeight);

  // // 0, 0으로 이동할 벡터 계산
  // const translation = Cesium.Cartesian3.fromDegrees(
  //     0 - currentLongitude, // 경도 차이
  //     0 - currentLatitude,  // 위도 차이
  //     0 - currentHeight     // 높이 차이 (여기서는 0으로 설정)
  // );

  // // 모델 행렬에 이동 변환 적용
  // const translationMatrix = Cesium.Matrix4.fromTranslation(translation);
  // Cesium.Matrix4.multiply(primitive.modelMatrix, translationMatrix, primitive.modelMatrix);
  // // primitive.modelMatrix = translationMatrix;
    
  // }

  // // DB 불러오기 버튼 클릭 이벤트
  const recallDBFunc = async (event) => {
   // moveCameraToOrigin();
   const viewer = cesiumManager.getViewer();
    const data = await apiRequest('GET', 'http://localhost:8080/api/getPolygon')

    const polygons = JSON.parse(data.data).geometry;
    
    polygonManager.recallPolygon(polygons);
  }
 // DB 불러오기 버튼 클릭 이벤트(GeoJson, geometry로 저장된 데이터 불러오기)
  const recallDBFunc2 = async (event) => {
    // moveCameraToOrigin();
    const viewer = cesiumManager.getViewer();
    console.log('recall data before0')
     const data = await apiRequest('GET', 'http://localhost:8080/api/getPolygonGeoJson')
     console.log('recall data before1')
     const polygons = data.data.map(d => JSON.parse(d.geometry));
     console.log('recall data after')
     
     polygonManager.recallPolygonGeojson(polygons);
   }

  // db 저장 로직
  const saveDBFunc = (event) => {
    const viewer = cesiumManager.viewer;
    const scene = viewer.scene;

    // 마우스 위치에서 Primitive 객체 선택
    const pickedObject = scene.pick(event.position);
    // const polygons = polygonManager.savePolygon();

    // console.log(polygons)
    if(Cesium.defined(pickedObject)){
      // 가져온 객체의 geometry에서 점들의 데이터 가져오기
      const geometryInstances = pickedObject.primitive.geometryInstances;

      // 지리적좌표계 polygon geometry 데이터
      const geometryPolygon = [];

      // 지리적 좌표계 정점 데이터
      const geometryVertexes = [];
      // 면들에서 점 1차원 배열로 생성
      const vertaxes = geometryInstances.flatMap((geometryInstance) => {
        // 지리적 좌표계로 변환
        const polygonData = [];
        geometryInstance.geometry._polygonHierarchy.positions.map((position) => { 
          const geographicData = convertCartesianToGeographic(position); 
          geometryVertexes.push(geographicData);
          polygonData.push(geographicData);
        });
        geometryPolygon.push(polygonData);
        return geometryInstance.geometry._polygonHierarchy.positions;
      });  

      // 점 중복값 제거
      // set은 reference를 비교하므로, 중복값 제거를 위해 새로운 배열 생성
      const geoUniqueVertices = [];
      geometryPolygon.map((vertex) => {
        vertex.map((v) => {
        if(!geoUniqueVertices.some((d) => d.longitude === v.longitude && d.latitude === v.latitude && d.height === v.height)) {
          geoUniqueVertices.push(v);
        }
        })
      })
      // 이거 구조 변경해야된다.
          
      // geoJson type converting
      const geoData = geometryPolygon.map((p) => {
    
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [p.map((d) => [d.longitude, d.latitude, d.height])]
          },
          properties: {
            name: 'Example Polygon'
          }
        }
      });

      console.log(geoData)
      const data = {
        name: 'test',
        vertices: geoUniqueVertices,
        data: geoData
      };

      // DB에 저장
      const res = apiRequest('POST', 'http://localhost:8080/api/saveModel', data)
      console.log(res);
      if(res){
        alert('저장 완료');
      }
      /** 
       * 중심점 계산해서 원하는 위치로 옮기는 코드
       * 문제1. 방위각 계산이 포함되어 있지 않아 지구 어디를 보내더라도 그 각도 그 방향 그대로 이동함.
       */
      // const center = Cesium.BoundingSphere.fromPoints(vertaxes).center;

      // viewer.entities.add({
      //   position: center,
      //   point: {
      //     pixelSize: 10,
      //     color: Cesium.Color.BLACK
      //   }
      // });

      // // 원하는 위치 (지리적 좌표계)
      // const newCenter = new Cesium.Cartesian3.fromDegrees(0,0,150000);
      // const defference = Cesium.Cartesian3.subtract(newCenter, center, new Cesium.Cartesian3());

      // const newVertaxces = vertaxes.map((vertax) => {
      //   return Cesium.Cartesian3.add(vertax, defference, new Cesium.Cartesian3());
      // });
     
      // newVertaxces.forEach((vertax) => {
      //   viewer.entities.add({
      //     position: vertax,
      //     point: {
      //       pixelSize: 10,
      //       color: Cesium.Color.RED
      //     }
      //   });
      // });

    } else {
      alert('No object selected.');
    }
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
            material: Cesium.Color.YELLOW.withAlpha(0.5)
          }}
        />
      )}
      {/* <Entity
          position={Cesium.Cartesian3.fromDegrees(-72.0, 41.7, -20000)}
          point={{ pixelSize: 10, color: Cesium.Color.RED }}
      />  */}
      {/* {centroidEntity} */}
      {/* 클릭된 좌표들에 대한 위치와 텍스트 표시 */}
      {buttonsState.showXYZ && clickedPositions.map(renderXYZEntity)}
      {buttonsState.showXYZ && renderXYZEntity(Cesium.Cartesian3.fromDegrees(0, 0, 0))}

      {/* 클릭된 좌표들에 대한 인덱스 표시 */}
      {buttonsState.showIndex && clickedPositions.map(renderIndexEntity)}
      <Cesium3DTileset url="../assets/MetadataGranularities/tileset.json" />
    </Viewer>
  );
};

export default ViewerComponent;
