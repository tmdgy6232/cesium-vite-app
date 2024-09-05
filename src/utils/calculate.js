import * as Cesium from "cesium";

/* Carterian3(직교)값 지리적좌표계 값으로 변환 후 중심점 구하고 다시 직교좌표계 값으로 변환하기 */
export function getCentroidCartesian(points) {
  let totalLongitude = 0;
  let totalLatitude = 0;
  let totalHeight = 0;

  points.forEach((cartesian) => {
    if (cartesian && !Cesium.Cartesian3.equals(cartesian, Cesium.Cartesian3.ZERO)) {
      // magnitude가 0인지 추가 체크
      const magnitude = Cesium.Cartesian3.magnitude(cartesian);
      if (magnitude === 0) {
        throw new Error('The Cartesian3 point has zero magnitude.');
      }
      const { longitude, latitude, height } = convertCartesianToGeographic(cartesian);
      totalLongitude += longitude;
      totalLatitude += latitude;
      totalHeight += height;
    } else {
      throw new Error("Cartesian3 value is invalid");
    }
  });

  const avgLongitude = totalLongitude / points.length;
  const avgLatitude = totalLatitude / points.length;
  const avgHeight = totalHeight / points.length;

  return Cesium.Cartesian3.fromDegrees(avgLongitude, avgLatitude, avgHeight);
}


/* Carterian3(직교)값 지리적좌표계 값으로 변환 후 중심점 구하고 반환 */
export function getCentroidGeograhpic(points) {
  let totalLongitude = 0;
  let totalLatitude = 0;
  let totalHeight = 0;
    
  points.forEach((cartesian) => {
    if (cartesian && !Cesium.Cartesian3.equals(cartesian, Cesium.Cartesian3.ZERO)) {
      // magnitude가 0인지 추가 체크
      const magnitude = Cesium.Cartesian3.magnitude(cartesian);
      if (magnitude === 0) {
        throw new Error('The Cartesian3 point has zero magnitude.');
      }

      const { longitude, latitude, height } = convertCartesianToGeographic(cartesian);
      totalLongitude += longitude;
      totalLatitude += latitude;
       totalHeight += height;
    } else {
      throw new Error("Cartesian3 value is invalid");
    }
  });

  const avgLongitude = totalLongitude / points.length;
  const avgLatitude = totalLatitude / points.length;
  const avgHeight = totalHeight / points.length;

  return {longitude: avgLongitude, latitude: avgLatitude, height:avgHeight};
}
const convertCartesianToGeographic = (cartesian) => {
    // 라디안 값으로 리턴하니
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    // 각도로 변환해줘야함
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height;
    return { longitude, latitude, height };
}

/**
 * function : 폴리곤 이동하기
 * @param {*} points : 직교좌표계 포인트 배열
 * @param {*} targetLongitude : 지리좌표계 목표 위도
 * @param {*} targetLatitude  : 지리좌표계 목표 경도
 * @param {*} targetHeight : 지리좌표계 목표 높이
 * @returns Cesium.Cartesian3[] = 도형 이동 후 좌표
 */
export const moveCentroidToCoordinate = (points, targetLongitude, targetLatitude, targetHeight) => {
  // 지리적 좌표계 중심점
  const centroid = getCentroidGeograhpic(points);
  console.log(`지리적 좌표계 중심점: ${centroid.avgLongitude}, ${centroid.avgLatitude}, ${centroid.avgHeight}`);
  // 도형 좌표별 지리적 좌표계 값
  const geographicPoints = points.map((point) => convertCartesianToGeographic(point));
  console.log(`도형 좌표별 지리적 좌표계 값: ${geographicPoints}`);
  // 중심점과 도형 좌표별 차이값 배열(지리적 좌표계)
  const diffPoints = diffPointsToCentroid(geographicPoints, centroid);
  console.log(`중심점과 도형 좌표별 차이값 배열(지리적 좌표계): ${diffPoints}`);

  // 리턴 좌표(직교좌표계)
  const movedPoints = diffPoints.map((point) => {
    return Cesium.Cartesian3.fromDegrees(point.diffLongitude - targetLongitude, point.diffLatitude - targetLatitude, point.diffHeight - targetHeight);
  });
  console.log(`이동된 좌표(직교좌표계): ${movedPoints}`);

  return movedPoints;
}

/*
 입력 : 지리적 좌표계 중심점, 도형 좌표별 지리적 좌표계 값
 return : 중심점과 도형 좌표별 지리적 좌표계 값의 차이의 배열.
*/
const diffPointsToCentroid = (points, centroid ) => {
  
  const diffPoints = points.map((point) => {
    const { longitude, latitude, height } = centroid;
      
    const diffLongitude = point.longitude - longitude;
    const diffLatitude = point.latitude - latitude;
    const diffHeight = point.height - height;
    return {diffLongitude, diffLatitude, diffHeight};
  });

  return diffPoints;
}


export const checkDistance = (point1, point2) => {
  const distance = Cesium.Cartesian3.distance(point1, point2); // 직선 거리
  console.log(`두 지점 사이의 직선 거리: ${distance} 미터`);

  return Cesium.Cartesian3.distance(point1, point2);
}


export const checkDistanceEllipsoid = (point1, point2) => {
  // 첫 번째 지점 (경도, 위도)
  const startCartographic = Cesium.Cartographic.fromCartesian(point1);
  // 두 번째 지점 (경도, 위도)
  const endCartographic = Cesium.Cartographic.fromCartesian(point2);
  // 지구 타원체를 기준으로 두 지점 사이의 거리 계산
  const geodesic = new Cesium.EllipsoidGeodesic(startCartographic, endCartographic);
  const surfaceDistance = geodesic.surfaceDistance; // 곡면 거리 (미터 단위)
  console.log(`두 지점 사이의 곡면 거리: ${surfaceDistance} 미터`);
  return surfaceDistance;
}