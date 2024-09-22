import * as Cesium from 'cesium';

/**
 * CesiumManager
 * @class
 * 
 */
class CesiumManager {
  constructor(viewer) {
    this.viewer = viewer;
  }

  addTileset(url) {
    this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url: url
    }));
  }

  // 카메라 이동
  moveCamera(longitude=2435, latitude=-4638.142451189, height=3000000) {
    
        this.viewer.scene.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(longitude,latitude, height),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
          }
        });
    }

  // getViewer
  getViewer() {
    return this.viewer;
  }
}

export default CesiumManager;