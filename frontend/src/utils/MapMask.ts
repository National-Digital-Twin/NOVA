import type { Map } from 'maplibre-gl';
import type { Feature, Polygon } from 'geojson';
import type { GeoJSONSource } from 'maplibre-gl';

/**
 * Utility class for applying and removing a dark overlay mask on a map,
 * leaving a transparent visual "hole" where the user-defined polygon is drawn.
 */
export class MapMask {
    // Unique ID for the source and layer used for masking
    private static sourceId = 'mask';
    private static layerId = 'mask-layer';


    /**
     * Applies a dimmed mask over the entire map except inside the given polygon.
     * If the mask source or layer already exists, it will update them.
     *
     * @param map - The MapLibre map instance
     * @param polygon - A GeoJSON Polygon to act as the visible cutout
     */
    static apply(map: Map, polygon: Polygon) {
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
        if (!map.getSource(MapMask.sourceId)) {
            map.addSource(MapMask.sourceId, {
                type: 'geojson',
                data: maskFeature
            });
        } else {
            const source = map.getSource(MapMask.sourceId) as GeoJSONSource;
            source.setData(maskFeature);
        }

        // Add layer if not present
        if (!map.getLayer(MapMask.layerId)) {
            map.addLayer({
                id: MapMask.layerId,
                type: 'fill',
                source: MapMask.sourceId,
                paint: {
                    'fill-color': '#000000',
                    'fill-opacity': 0.5
                }
            });
        }
    }

    /**
     * Removes the mask layer and source from the map, if they exist.
     *
     * @param map - The MapLibre map instance
     */
    static remove(map: Map) {
        if (map.getLayer(MapMask.layerId)) {
            map.removeLayer(MapMask.layerId);
        }
        if (map.getSource(MapMask.sourceId)) {
            map.removeSource(MapMask.sourceId);
        }
    }
}
