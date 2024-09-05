import React, { useState, useRef, useEffect } from 'react';
import { Viewer, Entity } from 'resium';
import * as Cesium from 'cesium';

// 회전 함수 - X, Y, Z축 회전 적용
const rotatePolygon = (positions, angleX, angleY, angleZ) => {
  const center = Cesium.Cartesian3.fromDegrees(-100.0, 40.0); // 중심점 좌표

  // 회전 행렬 생성
  const rotationMatrixX = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(angleX));
  const rotationMatrixY = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(angleY));
  const rotationMatrixZ = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angleZ));

  return positions.map((pos) => {
    const localPos = Cesium.Cartesian3.subtract(pos, center, new Cesium.Cartesian3()); // 중심점 기준으로 좌표 이동

    // X, Y, Z축 회전 적용
    const rotatedPosX = Cesium.Matrix3.multiplyByVector(rotationMatrixX, localPos, new Cesium.Cartesian3());
    const rotatedPosY = Cesium.Matrix3.multiplyByVector(rotationMatrixY, rotatedPosX, new Cesium.Cartesian3());
    const rotatedPosZ = Cesium.Matrix3.multiplyByVector(rotationMatrixZ, rotatedPosY, new Cesium.Cartesian3());

    return Cesium.Cartesian3.add(center, rotatedPosZ, new Cesium.Cartesian3()); // 다시 원래 위치로 이동
  });
};

const App = () => {
  const [polygonPosition] = useState([
    Cesium.Cartesian3.fromDegrees(-100.0, 40.0),
    Cesium.Cartesian3.fromDegrees(-105.0, 40.0),
    Cesium.Cartesian3.fromDegrees(-105.0, 35.0),
    Cesium.Cartesian3.fromDegrees(-100.0, 35.0),
  ]);

  const rotationAngles = useRef({ x: 0, y: 0, z: 0 }); // 각도를 useRef로 관리해 불필요한 리렌더링 방지
  const viewerRef = useRef(null); // Viewer 참조

  const [rotatedPositions, setRotatedPositions] = useState(polygonPosition);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      // 각도를 업데이트
      rotationAngles.current.x += 1;
      rotationAngles.current.y += 1;
      rotationAngles.current.z += 1;

      // 좌표 회전 업데이트
      setRotatedPositions(rotatePolygon(polygonPosition, rotationAngles.current.x, rotationAngles.current.y, rotationAngles.current.z));

      // 다음 프레임 요청
      animationFrameId = requestAnimationFrame(animate);
    };

    // 애니메이션 시작
    animationFrameId = requestAnimationFrame(animate);

    // 컴포넌트가 언마운트될 때 애니메이션 중지
    return () => cancelAnimationFrame(animationFrameId);
  }, [polygonPosition]);

  return (
    <Viewer ref={viewerRef} full>
      <Entity
        polygon={{
          hierarchy: new Cesium.PolygonHierarchy(rotatedPositions),
          extrudedHeight: 50000,
          material: Cesium.Color.RED.withAlpha(0.5),
        }}
      />
    </Viewer>
  );
};

export default App;
