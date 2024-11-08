import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import * as Cesium from 'cesium';
import {Cartesian3, Math as CesiumMath, Cartographic} from 'cesium';

function AxisArrow({ position, rotation, color, onclick, label }) {
  const coneRef = useRef();
  const { camera } = useThree(); // 기본 Three.js 카메라 접근
  return (
    <group>
    <mesh ref={coneRef} position={position} rotation={rotation} onClick={onclick}>
      <coneGeometry args={[0.1, 0.5, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
     {/* Label 추가 */}
     <Text
        position={[position[0] * 2, position[1] * 2, position[2] * 2]} // 축 옆에 라벨 배치
        fontSize={0.3}
        color={color}
      >
        {label}
      </Text>
    </group>
  );
}

function AxesHelper({viewer, cesiumCameraMove}) {
  const groupRef = useRef();
  const offset = 0.6; // 중심 정육면체에서의 거리 조정

  // Gizmo의 초기 회전을 설정하기 위해 Quaternion 생성
  // 여기서는 Z축을 기준으로 45도 회전을 없애기 위해 보정
  const initialRotation = new THREE.Euler(0, Math.PI / 2, 0, 'XYZ'); // 초기 Y 축을 올바르게 맞춤
  const initialQuaternion = new THREE.Quaternion().setFromEuler(initialRotation);

  const rotateCamera = ( axis ) => {
    const cesiumCamera = viewer.camera;

  }
  /** */
  useFrame(() => {
    if (viewer && groupRef.current) {
      const cesiumCamera = viewer.camera;

      // Cesium 카메라의 heading, pitch, roll 가져오기
      const heading = cesiumCamera.heading;
      const pitch = cesiumCamera.pitch;
      const roll = cesiumCamera.roll;

      // Three.js의 Euler를 사용하여 회전 설정 (heading, pitch, roll 적용)
      const euler = new THREE.Euler(
        -pitch,              // pitch는 반대 방향으로 설정해야 일치
        heading,            // heading도 반대로 설정
        roll,                // roll은 그대로 사용
        'YXZ'                // Cesium과 유사한 회전 순서
      );
      const cameraDirection = cesiumCamera.directionWC;

      // Three.js 회전을 위한 Euler 변환 설정
      // const directionVector = new THREE.Vector3(cameraDirection.x, cameraDirection.y, cameraDirection.z);
      const targetQuaternion = new THREE.Quaternion().setFromEuler(euler);

      // Gizmo 그룹의 회전 적용
      groupRef.current.quaternion.slerp(targetQuaternion, 0.1); // 부드러운 회전을 위해 slerp 사용
    }
  });
  return (
    <group ref={groupRef} >
      {/* X Axis - Positive and Negative */}
      <AxisArrow
        position={[offset, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        color="red"
        onclick={() => cesiumCameraMove('X')}
        label={'X'}
      />
      <AxisArrow
        position={[-offset, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onclick={() => cesiumCameraMove('-X')}
        color="white"
      />

     
      {/* Y Axis - Positive and Negative */}
      <AxisArrow
        position={[0, 0, -offset]}  
        rotation={[Math.PI / 2, 0, 0]}
        color="blue"
        onclick={() => cesiumCameraMove('Y')}
        label = {'Y'}
      />
      <AxisArrow
        position={[0, 0, offset]}
        rotation={[-Math.PI / 2, 0, 0]}
        onclick={() => cesiumCameraMove('-Y')}
        color="white"
      />

      {/* Z Axis - Positive and Negative */}
      <AxisArrow
              position={[0, offset, 0]}
              rotation={[0, 0, Math.PI]}
              color="green"
              onclick={() => cesiumCameraMove('Z')}
              label = {'Z'}
            />
            <AxisArrow
              position={[0, -offset, 0]}
              rotation={[0, 0, 0]}
              onclick={() => cesiumCameraMove('-Z')}
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

  const handleCesiumCamera = ( axis ) => {
    
    const basePosition = new Cartesian3(-3200881.2554188543, 4142132.645124223, 3631696.886811437); // 기준 위치 좌표
    const offsetDistance = 0; // 카메라 오프셋 거리
    const viewer = cesiumViewer;
      //const entityPosition = selectedEntity.position.getValue(Cesium.JulianDate.now());
    
       // 각 축에 따른 카메라 목표 위치와 방향 설정
    let targetPosition;
    let orientation;
    let angle = 0;
    // 선택된 축을 기준으로 카메라 이동/회전
  switch (axis) {
      case 'X':
        angle = 90;
        setCameraPosition(viewer, basePosition, angle, 100, axis);
        break;

      case 'Y':
        angle = 180;
        setCameraPosition(viewer, basePosition, angle, 100, axis);
        break;

      case 'Z':
        angle = 0;
        setCameraPosition(viewer, basePosition, angle, 100, axis);        
        break;

      case '-X':
        angle = 270;
        setCameraPosition(viewer, basePosition, angle, 100, axis);
      break;

      case '-Y':
        angle = 0;
        setCameraPosition(viewer, basePosition, angle, 100, axis);
        break;

      case '-Z':
        angle = 0;
        setCameraPosition(viewer, basePosition, angle, 100, axis);
        break;

      default:
        console.error("Invalid axis");
        return;
    }
  }

  // basePoint는 선택된 객체의 위치입니다. (Cesium.Cartesian3 객체)
  // distance는 카메라와 객체 간의 거리입니다. (예: 100미터)
  const setCameraPosition = (viewer, basePoint, angle, distance, axis) => {


    // ECEF 좌표계에서 ENU (East-North-Up) 로컬 좌표계 행렬 생성
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(basePoint);

    // 각도를 라디안으로 변환 cesium 설정때문에 최초 0도가 동쪽을 바라보기때문에 -90해줘야 진북을 봄.
    let radianAngle = Cesium.Math.toRadians(angle-90);

    // offset
    let offset;
    //camera orientation
    let orientation;

    // gizmo axis 마다 offset 계산 
    switch (axis) {
      case 'X':

        // ENU 좌표에서의 offset 계산
        offset = new Cesium.Cartesian3(
          distance * Math.cos(radianAngle),  // 동쪽 오프셋
          distance * Math.sin(radianAngle),  // 북쪽 오프셋
          0  // 수평을 유지하기 위해 Z 오프셋을 0으로 설정
        ) 

        orientation = {
          heading: Cesium.Math.toRadians(-angle),  // 카메라 방향 설정
          pitch: Cesium.Math.toRadians(0), 
          roll: 0.0
        }
        break;

      case 'Y':
        // ENU 좌표에서의 offset 계산
        offset = new Cesium.Cartesian3(
          distance * Math.cos(radianAngle),  // 동쪽 오프셋
          distance * Math.sin(radianAngle),  // 북쪽 오프셋
          0  // 수평을 유지하기 위해 Z 오프셋을 0으로 설정
        ) 
        orientation = {
          heading: Cesium.Math.toRadians(angle),  // 카메라 방향 설정
          pitch: Cesium.Math.toRadians(0), 
          roll: 0.0
        }
        break;

      case 'Z':
        offset = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Z, distance, new Cesium.Cartesian3());//z축 오프셋      
        orientation = {
          heading: Cesium.Math.toRadians(angle),  // 카메라 방향 설정
          pitch: Cesium.Math.toRadians(-90), 
          roll: 0.0
        }
        break;

      case '-X':
        // ENU 좌표에서의 offset 계산
        offset = new Cesium.Cartesian3(
          distance * Math.cos(radianAngle),  // 동쪽 오프셋
          distance * Math.sin(radianAngle),  // 북쪽 오프셋
          0  // 수평을 유지하기 위해 Z 오프셋을 0으로 설정
        ) 
        orientation = {
          heading: Cesium.Math.toRadians(-angle),  // 카메라 방향 설정
          pitch: Cesium.Math.toRadians(0), 
          roll: 0.0
        }
        break;

      case '-Y':
        // ENU 좌표에서의 offset 계산
        offset = new Cesium.Cartesian3(
          distance * Math.cos(radianAngle),  // 동쪽 오프셋
          distance * Math.sin(radianAngle),  // 북쪽 오프셋
          0  // 수평을 유지하기 위해 Z 오프셋을 0으로 설정
        ) 
        orientation = {
          heading: Cesium.Math.toRadians(angle),  // 카메라 방향 설정
          pitch: Cesium.Math.toRadians(0), 
          roll: 0.0
        }
        break;

      case '-Z':
        offset = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Z, -distance, new Cesium.Cartesian3());//z축 오프셋      
        orientation = {
          heading: Cesium.Math.toRadians(angle),  // 카메라 방향 설정
          pitch: Cesium.Math.toRadians(90), 
          roll: 0.0
        }
        break;
      default:
        console.error("Invalid axis");
        return;

    }
    
  

    // ENU 좌표계에서 offset을 적용한 위치를 ECEF 좌표로 변환
    const cameraPosition = Cesium.Matrix4.multiplyByPoint(transform, offset, new Cesium.Cartesian3());
    
   

    // 카메라를 새로운 위치로 이동하고 객체를 바라보도록 설정
    viewer.camera.setView({
        destination: cameraPosition,
        orientation
      });
    // 포인트 추가
    viewer.entities.add({
      position:cameraPosition, // 경도, 위도
      point: {
          pixelSize: 10, // 점의 크기
          color: Cesium.Color.RED, // 점의 색상
          outlineColor: Cesium.Color.WHITE, // 점의 외곽선 색상
          outlineWidth: 2 // 외곽선 두께
      }
    });
    const heading = CesiumMath.toDegrees(viewer.camera.heading);
    const pitch = CesiumMath.toDegrees(viewer.camera.pitch);
    const roll = CesiumMath.toDegrees(viewer.camera.roll);
    
    console.log(`camera heading: ${viewer.camera.heading}, ${heading}`)
    console.log(`camera pitch: ${viewer.camera.pitch}, ${pitch}`)
    console.log(`camera roll: ${viewer.camera.roll}, ${roll}`)
  };

  return (
    <div className="gizmo-overlay">
      <Canvas camera={{ position: [0, 0, 5], zoom: 2 }}>
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AxesHelper viewer={cesiumViewer} cesiumCameraMove={handleCesiumCamera}/>
        {/* <CameraSync viewer={cesiumViewer} /> */}
        <OrbitControls enableZoom={false} enableRotate={false}/>
      </Canvas>
    </div>
  );
}

export default App;
