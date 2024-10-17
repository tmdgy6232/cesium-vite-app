import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSG } from 'three-csg-ts';  // three-csg-ts 라이브러리 사용

const ThreeCSGExample = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Three.js 기본 설정
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 카메라 위치 설정
    camera.position.z = 20;

    // 1. 외부 큐브 생성 (더 큰 큐브)
    const outerGeometry = new THREE.BoxGeometry(10, 10, 10, 4, 4, 4);
    const outerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });  // 시각화를 위한 기본 재질
    const outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);

    // 2. 내부 큐브 생성 (더 작은 큐브, 가운데를 비우기 위한 큐브)
    const innerGeometry = new THREE.BoxGeometry(6, 6, 10);  // 작은 큐브
    const innerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);

    // 3. CSG 연산을 사용하여 차집합 수행 (외부 큐브 - 내부 큐브)
    const outerCSG = CSG.fromMesh(outerMesh);  // 외부 큐브를 CSG 객체로 변환
    const innerCSG = CSG.fromMesh(innerMesh);  // 내부 큐브를 CSG 객체로 변환
    const subtractedCSG = outerCSG.subtract(innerCSG);  // 차집합 연산 수행

    // 4. 결과 메쉬로 변환
    const resultMesh = CSG.toMesh(subtractedCSG, outerMesh.matrix, new THREE.MeshNormalMaterial());
    scene.add(resultMesh);

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);
      resultMesh.rotation.x += 0.01;
      resultMesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Clean up Three.js on component unmount
    return () => {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeCSGExample;
