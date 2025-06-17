import type { Polygon } from 'geojson';

export function getPolygonConfirmationPopupPositionFromPolygon(polygon: Polygon): [number, number] {
    const coords = polygon.coordinates[0];
    const topLat = Math.max(...coords.map(([, lat]) => lat));
    const avgLng = coords.reduce((sum, [lng]) => sum + lng, 0) / coords.length;
    return [avgLng, topLat];
}