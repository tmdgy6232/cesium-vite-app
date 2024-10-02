import * as Cesium from 'cesium';
import { convertCartesianToGeographic } from './calculate';
/**
 * PolygonManager
 * @param {Cesium.Viewer} viewer
 * @returns PolygonManager
 * @example
 * const polygonManager = new PolygonManager(viewer);
 * 
 * makePolygon(positions)
 * - viewer에 폴리곤을 생성합니다.
 * 
 * movePolygon(polygon, targetLongitude, targetLatitude, targetHeight)
 * - viewer에 폴리곤을 이동합니다.
 * 
 * removePolygon(polygon)
 * - viewer에 폴리곤을 제거합니다.
 * 
 * removeAllPolygons()
 * - viewer에 있는 모든 폴리곤을 제거합니다.
 * 
 * convert3Dpolygon()
 * - viewer에 있는 폴리곤을 3D 폴리곤으로 변환합니다.
 * 
 * savePolygon()
 * - viewer에 있는 폴리곤을 저장합니다.
 * 
 * recallPolygon()
 * - db에 저장된 폴리곤을 불러옵니다.
 */

class PolygonManager {
    constructor(viewer) {
        this.viewer = viewer;
    }

    makePolygon(positions) {
      console.log('init')
        const polygon = this.viewer.entities.add({
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
                material: Cesium.Color.RED.withAlpha(0.5),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
            },
        });
    }

    movePolygon(polygon, targetLongitude, targetLatitude, targetHeight) {
        const positions = polygon.polygon.hierarchy.getValue().positions;
        const newPositions = positions.map((position) => {
            const { longitude, latitude, height } = convertCartesianToGeographic(position);
            return Cesium.Cartesian3.fromDegrees(targetLongitude, targetLatitude, targetHeight);
        });

        polygon.polygon.hierarchy = newPositions;
    }

    removePolygon(polygon) {
        this.viewer.entities.remove(polygon);
    }

    removeAllPolygons() {
        this.viewer.entities.removeAll();
    }

    convert3Dpolygon(pickPolygon, targetHeight) {
        if (Cesium.defined(pickPolygon) && pickPolygon.id && pickPolygon.id.polygon) {
            // bottom position
            console.log(pickPolygon)
        } else {
            console.log('this is not a polygon');
        }
        
    const bottomPositions = pickPolygon.id.polygon.hierarchy.getValue().positions;

    const upperPositions = bottomPositions.map((position) => {
        const { longitude, latitude, height } = convertCartesianToGeographic(position);
        return Cesium.Cartesian3.fromDegrees(longitude, latitude, targetHeight);
    });
//     const upperPositions = Cesium.Cartesian3.fromDegreesArrayHeights([
//       -72.0, 40.0, 300000,
//       -70.0, 35.0, 300000,
//       -75.0, 30.0, 300000,
//   ]);
  
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
    const sideGemoetryInstance =  bottomPositions.map((position, index) => {
      const bottom = [position, bottomPositions[(index + 1) % bottomPositions.length]];
      const upper = [upperPositions[index], upperPositions[(index + 1) % upperPositions.length]];
      const side = [bottom[0], upper[0], upper[1], bottom[1], bottom[0]];
      // const side = [...bottom, ...upper];
      // const side = [bottom[0], upper[0], upper[1], bottom[1]]
  
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
    const primitiveData = new Cesium.Primitive({
      geometryInstances: [bottomGeometryInstance, upperGeometryInstance, ...sideGemoetryInstance],
      appearance: new Cesium.PerInstanceColorAppearance(),
      releaseGeometryInstances: false,
      // 이게 너무 중요하다!!!! 이거 없으면 지오메트리가 안보임
    });
    // primitiveData.uniqueTest = 'test'
    this.viewer.scene.primitives.add(primitiveData);
    }

    savePolygon() {
        console.log('savePolygon')
        console.log(this.viewer)
        console.log(this.viewer.entities.values)
        const polygons = this.viewer.entities.values.map((entity) => {
            return entity.polygon.hierarchy.getValue().positions;
        });
        
        // save to db
        return polygons
    }

    recallPolygon(polygons) {

      const instanceArray = [];
    
      for(let i = 0; i < polygons.length; i++) {
        const polygon =  new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(polygons[i].map((vertex) => Cesium.Cartesian3.fromDegrees(vertex.longitude, vertex.latitude, vertex.height))),
          perPositionHeight: true,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT  // Appearance와 맞는 vertexFormat 사용
       });
  
       const geometryInstance = new Cesium.GeometryInstance({
        geometry: polygon,
        attributes: {
          color:  Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE)  // 색상 설정
        }
      });
      
      instanceArray.push(geometryInstance);
     }
  
     const primitiveData = new Cesium.Primitive({
      geometryInstances: [...instanceArray],
      appearance: new Cesium.PerInstanceColorAppearance(),
      releaseGeometryInstances: false,
      // 이게 너무 중요하다!!!! 이거 없으면 지오메트리가 안보임
      });
      this.viewer.scene.primitives.add(primitiveData);
    }
}

export default PolygonManager;