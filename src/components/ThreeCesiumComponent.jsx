import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as Cesium from 'cesium';
import { CSG } from 'three-csg-ts'; // CSG를 named import로 수정

const ThreeToCesiumExample = () => {
  const cesiumContainerRef = useRef(null);

  useEffect(() => {
    // 1. Cesium Viewer 설정 (기본 지형 사용)
    const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),  // 기본 지형 사용
      shouldAnimate: true,
    });

    // 2. 외부 큐브 생성 (더 큰 큐브)
    const outerGeometry = new THREE.BoxGeometry(10, 10, 10, 4, 4, 4);
    const outerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);

    // 3. 내부 큐브 생성 (더 작은 큐브)
    const innerGeometry = new THREE.BoxGeometry(6, 6, 10);
    const innerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);

    // 4. CSG 연산을 사용하여 차집합 수행 (외부 큐브 - 내부 큐브)
    const outerCSG = CSG.fromMesh(outerMesh);  // 외부 큐브를 CSG 객체로 변환
    const innerCSG = CSG.fromMesh(innerMesh);  // 내부 큐브를 CSG 객체로 변환
    const subtractedCSG = outerCSG.subtract(innerCSG);  // 차집합 연산 수행

    // 5. 결과 메쉬로 변환
    const resultMesh = CSG.toMesh(subtractedCSG, outerMesh.matrix, new THREE.MeshNormalMaterial());

    // 6. BufferGeometry의 position 데이터를 가져옴 (fromGeometry 제거)
    const positions = resultMesh.geometry.attributes.position.array;

    // 7. Three.js에서 Cesium의 Cartesian3로 변환할 좌표 (경도, 위도, 고도)
    const longitude = -75.59777; // 원하는 위치의 경도
    const latitude = 40.03883;   // 원하는 위치의 위도
    const height = 1500;         // 원하는 위치의 고도

    // Cesium에서 사용되는 Cartesian3 좌표로 변환
    const cesiumPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

    // Cesium Cartesian3 배열로 변환
    const cesiumPositions = [];
    for (let i = 0; i < positions.length; i += 3) {
      cesiumPositions.push(
        new Cesium.Cartesian3(positions[i], positions[i + 1], positions[i + 2])
      );
    }

    // Color attribute 추가
    const colors = [];
    for (let i = 0; i < positions.length; i += 3) {
      // 임의의 색상값을 추가 (R, G, B 값을 0~1 사이로 설정)
      colors.push(1.0, 0.0, 0.0); // 빨간색으로 설정
    }

    // 8. GeometryInstance를 사용해 위치 지정
    const cesiumGeometry = new Cesium.GeometryInstance({
      geometry: new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: Cesium.Cartesian3.packArray(cesiumPositions),
          }),
          color: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 3,
            values: new Float32Array(colors),
          }),
        },
        indices: Array.from(resultMesh.geometry.index.array), // Three.js의 인덱스 데이터 사용
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(Cesium.Cartesian3.packArray(cesiumPositions)),
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT, // Vertex format 추가
      }),
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(cesiumPosition), // 위치를 지정하는 좌표계
    });

    // 9. Cesium 장면에 추가 (비동기 처리 비활성화)
    viewer.scene.primitives.add(new Cesium.Primitive({
      geometryInstances: [cesiumGeometry],
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        translucent: false,
        closed: true,
      }),
      asynchronous: false,  // 비동기 처리 비활성화
    }));

    // Cesium 카메라 위치
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1000),
    });

    return () => {
      if (viewer) viewer.destroy();
    };
  }, []);

  return <div ref={cesiumContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeToCesiumExample;
