import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

const BOUNDS = { minLng: -1.58, maxLng: -1.06, minLat: 50.58, maxLat: 50.77 };

const generateRandomPoint = () => ({
    lng: BOUNDS.minLng + Math.random() * (BOUNDS.maxLng - BOUNDS.minLng),
    lat: BOUNDS.minLat + Math.random() * (BOUNDS.maxLat - BOUNDS.minLat),
});

const generateRandomPolygon = (): Feature<Polygon> => {
    const center = generateRandomPoint();
    const radius = 0.005 + Math.random() * 0.01;
    const points = 5 + Math.floor(Math.random() * 5);

    const coordinates = Array.from({ length: points }, (_, i) => {
        const angle = (i / points) * 2 * Math.PI;
        return [center.lng + radius * Math.cos(angle), center.lat + radius * Math.sin(angle)];
    });

    coordinates.push(coordinates[0]);

    return {
        type: 'Feature',
        properties: { color: `rgb(0, 255, 0)`, opacity: 0.6 },
        geometry: { type: 'Polygon', coordinates: [coordinates] },
    };
};

const RandomPolygonsLayer = () => {
    const polygons: FeatureCollection<Polygon> = useMemo(
        () => ({ type: 'FeatureCollection', features: Array.from({ length: 10 }, generateRandomPolygon) }),
        []
    );

    return (
        <Source type="geojson" data={polygons}>
            <Layer
                id="random-polygons"
                type="fill"
                paint={{
                    'fill-color': ['get', 'color'],
                    'fill-opacity': ['get', 'opacity'],
                    'fill-outline-color': '#000',
                }}
            />
        </Source>
    );
};

export default RandomPolygonsLayer;
