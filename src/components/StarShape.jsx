import React from 'react';
import { Viewer, Entity, PolygonGraphics } from 'resium';
import { Cartesian3, Color } from 'cesium';

function generateStarPoints(centerLon, centerLat, outerRadius, innerRadius, numPoints) {
    const points = [];
    const angleStep = Math.PI / numPoints;

    for (let i = 0; i < 2 * numPoints; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * angleStep;
        const lon = centerLon + radius * Math.sin(angle);
        const lat = centerLat + radius * Math.cos(angle);
        points.push(lon, lat);
    }
    return points;
}

const StarShape = () => {
    const centerLon = 126.97224; // 중심 경도 (서울 예시)
    const centerLat = 37.5665; // 중심 위도 (서울 예시)
    const outerRadius = 0.05; // 바깥쪽 반경 (위도/경도로 계산)
    const innerRadius = 0.02; // 안쪽 반경
    const numPoints = 5; // 5각별

    const positions = generateStarPoints(centerLon, centerLat, outerRadius, innerRadius, numPoints);

    const cartesianPositions = positions.map((_, index, arr) => {
        if (index % 2 === 0) {
            const lon = arr[index];
            const lat = arr[index + 1];
            return Cartesian3.fromDegrees(lon, lat, 10000); // 고도 10km
        }
        return null;
    }).filter(pos => pos !== null);

    return (
        <Viewer full>
            <Entity>
                <PolygonGraphics
                    hierarchy={cartesianPositions}
                    material={Color.RED.withAlpha(0.7)}
                />
            </Entity>
        </Viewer>
    );
}

export default StarShape;
