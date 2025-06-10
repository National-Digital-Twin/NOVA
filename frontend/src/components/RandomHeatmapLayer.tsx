import type { Feature, FeatureCollection, Point } from 'geojson';
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

const BOUNDS = { minLng: -1.58, maxLng: -1.06, minLat: 50.58, maxLat: 50.77 };

const generateRandomPoint = () => ({
    lng: BOUNDS.minLng + Math.random() * (BOUNDS.maxLng - BOUNDS.minLng),
    lat: BOUNDS.minLat + Math.random() * (BOUNDS.maxLat - BOUNDS.minLat),
});

const generateRandomPoints = (): Feature<Point> => {
    const point = generateRandomPoint();

    return {
        type: 'Feature',
        properties: { intensity: Math.random() },
        geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
    };
};

const RandomHeatmapLayer = () => {
    const points: FeatureCollection<Point> = useMemo(
        () => ({ type: 'FeatureCollection', features: Array.from({ length: 10 * 10 }, generateRandomPoints) }),
        []
    );

    return (
        <Source type="geojson" data={points}>
            <Layer
                id="random-heatmap"
                type="heatmap"
                maxzoom={10}
                paint={{
                    'heatmap-weight': ['get', 'intensity'],
                    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 10, 5],
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
                    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 10],
                    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 8, 1, 10, 0.2],
                }}
            />
            <Layer
                id="random-heatmap-points"
                type="circle"
                minzoom={8}
                paint={{
                    'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 2, 15, 10],
                    'circle-color': 'rgba(103,169,207,0.8)',
                    'circle-stroke-width': 1,
                    'circle-stroke-color': 'rgba(255,255,255,0.5)',
                    'circle-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 15, 1],
                }}
            />
        </Source>
    );
};

export default RandomHeatmapLayer;
