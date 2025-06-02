import React, { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl';

const IOW_BOUNDS = { minLng: -1.5937, maxLng: -1.0623, minLat: 50.5761, maxLat: 50.7696 };

const generateRandomPoint = () => {
    const lng = IOW_BOUNDS.minLng + Math.random() * (IOW_BOUNDS.maxLng - IOW_BOUNDS.minLng);
    const lat = IOW_BOUNDS.minLat + Math.random() * (IOW_BOUNDS.maxLat - IOW_BOUNDS.minLat);
    return [lng, lat];
};

function WindTurbines({ visible = true }) {
    const windTurbinesData = useMemo(() => {
        const features = [];

        for (let i = 0; i < 100; i++) {
            const point = generateRandomPoint();

            features.push({
                type: 'Feature',
                properties: { id: i, name: `Wind Turbine ${i + 1}`, intensity: 0.5 + Math.random() * 0.5 },
                geometry: { type: 'Point', coordinates: point },
            });
        }

        return { type: 'FeatureCollection', features };
    }, []);

    const heatmapLayerStyle = {
        id: 'wind-turbines-heat',
        type: 'heatmap',
        paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 1, 15, 3],
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33,102,172,0)',
                0.2,
                'rgb(103,169,207)',
                0.4,
                'rgb(209,229,240)',
                0.6,
                'rgb(253,219,199)',
                0.8,
                'rgb(239,138,98)',
                1,
                'rgb(178,24,43)',
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 8, 15, 20],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0.7, 15, 0.5],
        },
    };

    const circleLayerStyle = {
        id: 'wind-turbines-point',
        type: 'circle',
        paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 2, 15, 5],
            'circle-color': ['interpolate', ['linear'], ['get', 'intensity'], 0.5, '#21BBFC', 1, '#2166AC'],
            'circle-stroke-width': 1,
            'circle-stroke-color': 'white',
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 15, 0.8],
        },
    };

    if (!visible) return null;

    return (
        <Source id="wind-turbines-source" type="geojson" data={windTurbinesData}>
            <Layer {...heatmapLayerStyle} />
            <Layer {...circleLayerStyle} />
        </Source>
    );
}

export default WindTurbines;
