import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/mapbox';

const IOW_BOUNDS = { minLng: -1.5937, maxLng: -1.0623, minLat: 50.5761, maxLat: 50.7696 };

const generateRandomPoint = () => {
    const lng = IOW_BOUNDS.minLng + Math.random() * (IOW_BOUNDS.maxLng - IOW_BOUNDS.minLng);
    const lat = IOW_BOUNDS.minLat + Math.random() * (IOW_BOUNDS.maxLat - IOW_BOUNDS.minLat);
    return [lng, lat];
};

const generateRandomPolygon = centerPoint => {
    const radius = 0.005 + Math.random() * 0.01;

    const numPoints = 6 + Math.floor(Math.random() * 6);
    const points = [];

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const adjustedRadius = radius * (0.8 + Math.random() * 0.4);
        const lng = centerPoint[0] + adjustedRadius * Math.cos(angle);
        const lat = centerPoint[1] + adjustedRadius * Math.sin(angle);
        points.push([lng, lat]);
    }

    points.push([...points[0]]);

    return points;
};

function ProtectedAreas({ visible = true }) {
    const protectedAreasData = useMemo(() => {
        const features = [];

        for (let i = 0; i < 10; i++) {
            const centerPoint = generateRandomPoint();
            const polygon = generateRandomPolygon(centerPoint);

            features.push({
                type: 'Feature',
                properties: {
                    id: i,
                    name: `Protected Area ${i + 1}`,
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [polygon],
                },
            });
        }

        return {
            type: 'FeatureCollection',
            features,
        };
    }, []);

    const layerStyle = {
        id: 'protected-areas-fill',
        type: 'fill',
        paint: {
            'fill-color': '#00FF00',
            'fill-opacity': 0.5,
            'fill-outline-color': '#00CC00',
        },
    };

    if (!visible) return null;

    return (
        <Source id="protected-areas-source" type="geojson" data={protectedAreasData}>
            <Layer {...layerStyle} />
        </Source>
    );
}

export default ProtectedAreas;
