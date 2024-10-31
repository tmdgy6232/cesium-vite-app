import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function AxisArrow({ position, rotation, color }) {
  const coneRef = useRef();
  const { camera } = useThree(); // 기본 Three.js 카메라 접근

  useFrame(() => {
    if (!coneRef.current) return;

    // 카메라와 원뿔 사이의 벡터
    const direction = new THREE.Vector3(...position).sub(camera.position).normalize();
    const axisDirection = new THREE.Vector3(...position).normalize();
    const angle = direction.angleTo(axisDirection);

    if(angle < 0.15 ) {
    console.log(`direction: ${direction.toArray()}`);
    console.log(`axisDirection: ${axisDirection.toArray()}`);
    console.log(`angle: ${angle}`);
    
    // 개별 원뿔의 각도에 따른 표시 제어
    
   // coneRef.current.visible = angle < 0.15; // 0.15 라디안 ≈ 15도
    }
    
  });

  return (
    <mesh ref={coneRef} position={position} rotation={rotation}>
      <coneGeometry args={[0.1, 0.5, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function AxesHelper({viewer}) {
  const groupRef = useRef();
  const offset = 0.7; // 중심 정육면체에서의 거리 조정

  useFrame(() => {
    if (viewer && groupRef.current) {
      const cesiumCamera = viewer.camera;
      const cameraDirection = cesiumCamera.directionWC;

      // Three.js 회전을 위한 Euler 변환 설정
      const directionVector = new THREE.Vector3(cameraDirection.x, cameraDirection.y, cameraDirection.z);
      const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), directionVector.normalize());

      // Gizmo 그룹의 회전 적용
      groupRef.current.quaternion.slerp(targetQuaternion, 0.1); // 부드러운 회전을 위해 slerp 사용
    }
  });
  return (
    <group ref={groupRef}>
      {/* X Axis - Positive and Negative */}
      <AxisArrow
        position={[offset, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        color="red"
      />
      <AxisArrow
        position={[-offset, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        color="white"
      />

      {/* Y Axis - Positive and Negative */}
      <AxisArrow
        position={[0, offset, 0]}
        rotation={[0, 0, Math.PI]}
        color="green"
      />
      <AxisArrow
        position={[0, -offset, 0]}
        rotation={[0, 0, 0]}
        color="white"
      />

      {/* Z Axis - Positive and Negative */}
      <AxisArrow
        position={[0, 0, offset]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="blue"
      />
      <AxisArrow
        position={[0, 0, -offset]}
        rotation={[Math.PI / 2, 0, 0]}
        color="white"
      />

      {/* Center Cube */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    </group>
  );
}

function CameraSync({ viewer }) {
  const { camera } = useThree();
  const prevLookAtPosition = useRef(new THREE.Vector3()); // 이전 lookAt 위치 저장
  const targetLookAt = useRef(new THREE.Vector3()); // 목표 lookAt 위치

  useFrame(() => {
    if (viewer) {
      const cesiumCamera = viewer.camera;
      const cameraDirection = cesiumCamera.directionWC;

      // 목표 lookAt 지점 설정
      targetLookAt.current.set(
        camera.position.x + cameraDirection.x,
        camera.position.y + cameraDirection.y,
        camera.position.z + cameraDirection.z
      );

      // 이전 값과 목표 값이 다를 경우만 업데이트
      if (!prevLookAtPosition.current.equals(targetLookAt.current)) {
        // 부드러운 전환을 위해 lerp 사용
        prevLookAtPosition.current.lerp(targetLookAt.current, 0.01);
        camera.lookAt(prevLookAtPosition.current);
      }
    }
  });

  return null;
}

function App({setGiamoManager, onAxisSelected, cesiumViewer}) {
  const canvasRef = useRef();
  useEffect(() => {
    
    function setGizmoManager() {
      setGiamoManager({
        selectAxis: (axis) => {
          onAxisSelected(axis);
        }
      });
    }
  }, [])
  return (
    <div className="gizmo-overlay">
      <Canvas camera={{ position: [3, 3, 3], zoom: 2 }}>
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AxesHelper viewer={cesiumViewer}/>
        {/* <CameraSync viewer={cesiumViewer} /> */}
        <OrbitControls enableZoom={false} enableRotate={false}/>
      </Canvas>
    </div>
  );
}

export default App;
