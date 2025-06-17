import type { Map } from 'maplibre-gl';
import type { Feature, Polygon } from 'geojson';
import type { GeoJSONSource } from 'maplibre-gl';

/**
 * Helper class for applying map visualisations when using MapLibre GL.
 */
export class MapVisualHelper {
    // Unique ID for the source and layer used for masking
    private static maskLayerSourceId = 'mask';
    private static maskLayerId = 'mask-layer';


    /**
     * Applies a dimmed mask over the entire map except inside the given polygon and centers the map on that polygon.
     * If the mask source or layer already exists, it will update them.
     *
     * @param map - The MapLibre map instance
     * @param polygon - A GeoJSON Polygon to act as the visible cutout
     */
    static applyDimmedMaskAndPanToPolygon(map: Map, polygon: Polygon) {
        const maskFeature: Feature<Polygon> = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-180, -85],
                        [180, -85],
                        [180, 85],
                        [-180, 85],
                        [-180, -85]
                    ],
                    polygon.coordinates[0]
                ]
            },
            properties: {}
        };

        // Add or update source
        if (!map.getSource(MapVisualHelper.maskLayerSourceId)) {
            map.addSource(MapVisualHelper.maskLayerSourceId, {
                type: 'geojson',
                data: maskFeature
            });
        } else {
            const source = map.getSource(MapVisualHelper.maskLayerSourceId) as GeoJSONSource;
            source.setData(maskFeature);
        }

        // Add layer if not present
        if (!map.getLayer(MapVisualHelper.maskLayerId)) {
            map.addLayer({
                id: MapVisualHelper.maskLayerId,
                type: 'fill',
                source: MapVisualHelper.maskLayerSourceId,
                paint: {
                    'fill-color': '#000000',
                    'fill-opacity': 0.5
                }
            });
        }

        // Centre the map on the polygon
        const coords = polygon.coordinates[0];
        let minLng = coords[0][0];
        let minLat = coords[0][1];
        let maxLng = coords[0][0];
        let maxLat = coords[0][1];

        coords.forEach(([lng, lat]) => {
            if (lng < minLng) minLng = lng;
            if (lat < minLat) minLat = lat;
            if (lng > maxLng) maxLng = lng;
            if (lat > maxLat) maxLat = lat;
        });

        map.fitBounds(
            [
                [minLng, minLat],
                [maxLng, maxLat]
            ],
            {
                padding: {
                    top: 50,
                    bottom: 50,
                    left: 450,   // 400px layer switcher width + 50px buffer
                    right: 50
                },
                duration: 2000
            }
        );
    }

    /**
     * Removes the mask layer and source from the map, if they exist.
     *
     * @param map - The MapLibre map instance
     */
    static removeDimmedMask(map: Map) {
        if (map.getLayer(MapVisualHelper.maskLayerId)) {
            map.removeLayer(MapVisualHelper.maskLayerId);
        }
        if (map.getSource(MapVisualHelper.maskLayerSourceId)) {
            map.removeSource(MapVisualHelper.maskLayerSourceId);
        }
    }

    /**
     * Calculates the position for a confirmation popup based on the polygon's coordinates.
     * The popup will be positioned at the average longitude and the maximum latitude of the polygon.
     *
     * @param polygon - The GeoJSON Polygon to base the popup position on
     * @returns A tuple containing the longitude and latitude for the popup position
     */
    static getConfirmationPopupCoordinates(polygon: Polygon): [number, number] {
        const coords = polygon.coordinates[0];
    
        const topLat = Math.max(...coords.map(([, lat]) => lat));
        const avgLng = coords.reduce((sum, [lng]) => sum + lng, 0) / coords.length;
    
        // Offset the popup upward slightly above the top point to make sure the polygon point is always visible for editing.
        const offsetLat = topLat + 0.0050;
    
        return [avgLng, offsetLat];
    }
}
