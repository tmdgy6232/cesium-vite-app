import React, { useState, useEffect, useRef } from 'react';
import { Viewer, Entity, ScreenSpaceEventHandler, ScreenSpaceEvent } from 'resium';
import * as Cesium from 'cesium';

const App = () => {
  const [clickedPosition, setClickedPosition] = useState(null);
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
    if (!isClickEnabled ) return;
    const scene = viewerRef.current.cesiumElement.scene;
    const cartesian = scene.camera.pickEllipsoid(event.position, scene.globe.ellipsoid);
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      console.log(cartographic)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);

      setClickedPosition({ lat: latitude, lon: longitude });
      console.log("Clicked Position:", latitude, longitude);
    }
  };

  return (
    <Viewer ref={viewerRef} full>
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent action={handleLeftClick} type={Cesium.ScreenSpaceEventType.LEFT_CLICK} />
      </ScreenSpaceEventHandler>
      {clickedPosition && (
        <Entity
          position={Cesium.Cartesian3.fromDegrees(clickedPosition.lon, clickedPosition.lat)}
          point={{ pixelSize: 10, color: Cesium.Color.RED }}
        />
      )}
    </Viewer>
  );
};

export default App;
