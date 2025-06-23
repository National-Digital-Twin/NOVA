import { LngLat, MapMouseEvent, type Map, Popup } from 'maplibre-gl';
import type { Feature, FeatureCollection, Geometry, Polygon } from 'geojson';
import type { GeoJSONSource } from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';

// Used to ensure mouse events include feature information. any type is used as property could be of any object.
type FeatureEvent = MapMouseEvent & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    features?: Feature<Geometry, { [key: string]: any }>[];
};

/**
 * Helper class for applying map visualisations when using MapLibre GL.
 */
export class MapVisualHelper {
    // Unique ID for the source and layer used for masking
    private static readonly maskLayerSourceId = 'mask';
    private static readonly maskLayerId = 'mask-layer';
    private static readonly heatmapLayerId = 'heatmap-layer';
    private static issuesPopup: Popup | null = null;

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
                        [-180, -85],
                    ],
                    polygon.coordinates[0],
                ],
            },
            properties: {},
        };

        if (!map.getSource(this.maskLayerSourceId)) {
            map.addSource(this.maskLayerSourceId, {
                type: 'geojson',
                data: maskFeature,
            });
        } else {
            const source = map.getSource(this.maskLayerSourceId) as GeoJSONSource;
            source.setData(maskFeature);
        }

        if (!map.getLayer(this.maskLayerId)) {
            map.addLayer({
                id: this.maskLayerId,
                type: 'fill',
                source: this.maskLayerSourceId,
                paint: {
                    'fill-color': '#000000',
                    'fill-opacity': 0.5,
                },
            });
        }

        const coords = polygon.coordinates[0];
        const lats = coords.map(([, lat]) => lat);
        const lngs = coords.map(([lng]) => lng);

        map.fitBounds(
            [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)],
            ],
            {
                padding: { top: 50, bottom: 50, left: 450, right: 66 },
                duration: 2000,
            }
        );
    }

    /**
     * Removes the mask layer and source from the map, if they exist.
     *
     * @param map - The MapLibre map instance
     */
    static removeDimmedMask(map: Map) {
        if (map.getLayer(this.maskLayerId)) map.removeLayer(this.maskLayerId);
        if (map.getSource(this.maskLayerSourceId)) map.removeSource(this.maskLayerSourceId);
    }

    /**
     * Calculates the position for a confirmation popup based on the polygon's coordinates.
     * The popup will be positioned at the average longitude and the maximum latitude of the polygon.
     *
     * @param polygon - The GeoJSON Polygon to base the popup position on
     * @param map - The React MapLibre map reference
     * @returns A [lng, lat] tuple of the suggested popup position
     */
    static getConfirmationPopupCoordinates(polygon: Polygon, map: MapRef): [number, number] {
        const coords = polygon.coordinates[0];
        const topLat = Math.max(...coords.map(([, lat]) => lat));
        const avgLng = coords.reduce((sum, [lng]) => sum + lng, 0) / coords.length;

        const point = map.project(new LngLat(avgLng, topLat));
        point.y -= 20;
        const offsetLngLat = map.unproject(point);
        return [offsetLngLat.lng, offsetLngLat.lat];
    }

    /**
     * Removes an existing popup from the map, if it exists.
     *
     * @param popupRef - A React ref to the popup instance
     */
    static removeExistingPopup(popupRef: React.RefObject<Popup | null>) {
        popupRef.current?.remove();
        popupRef.current = null;
    }

    /**
     * Flies the map to a specific location with a smooth animation.
     *
     * @param mapRef - A React ref to the MapLibre map instance
     * @param lat - Latitude of the target location
     * @param lng - Longitude of the target location
     * @param zoom - Zoom level for the target location
     * @param duration - Duration of the flyTo animation in milliseconds (default is 2000ms)
     */
    static flyToLocation(mapRef: React.RefObject<MapRef>, lat: number, lng: number, zoom: number, duration = 2000) {
        const map = mapRef.current?.getMap();
        if (!map) return;
        map.flyTo({ center: [lng, lat], zoom, duration });
    }

    /**
     * Retrieves the first polygon from the Mapbox Draw instance.
     * If no polygon exists, returns null.
     *
     * @param draw - The Mapbox Draw polygon instance
     * @returns The first polygon geometry or null if none exists
     */
    static getFirstPolygon(draw: MapboxDraw): Polygon | null {
        const feature = (draw.getAll() as unknown as FeatureCollection).features[0];
        return feature?.geometry?.type === 'Polygon' ? (feature.geometry as Polygon) : null;
    }

    /**
     * Extracts the first polygon from a GeoJSON FeatureCollection.
     * If no polygon exists, returns null.
     *
     * @param geojson - The GeoJSON FeatureCollection to extract from
     * @returns The first polygon geometry or null if none exists
     */
    static extractFirstPolygon(geojson: FeatureCollection<Geometry>): Polygon | null {
        const geometry = geojson.features[0]?.geometry;
        return geometry?.type === 'Polygon' ? (geometry as Polygon) : null;
    }

    /**
     * Retrieves the entire feature collection from the Mapbox Draw instance.
     *
     * @param draw - The Mapbox Draw polygon instance
     * @returns The feature collection containing all drawn geometries
     */
    static getFeatureCollection(draw: MapboxDraw): FeatureCollection<Geometry> {
        return draw.getAll() as unknown as FeatureCollection<Geometry>;
    }

    /**
     * Adds or updates a polygon fill layer showing suitability scores on the map.
     * Also adds interactivity for click (issue descriptions).
     *
     * @param mapRef - A React ref to the MapLibre map instance
     * @param geojson - The FeatureCollection containing polygons with a "suitability" and "issues" property
     */
    static addOrUpdateHeatmapLayer(mapRef: React.RefObject<MapRef>, geojson: FeatureCollection) {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const id = this.heatmapLayerId;

        if (!map.getSource(id)) {
            map.addSource(id, { type: 'geojson', data: geojson });

            map.addLayer({
                id,
                type: 'fill',
                source: id,
                paint: {
                    'fill-color': ['match', ['get', 'suitability'], 'red', '#e74c3c', 'amber', '#f39c12', 'green', '#27ae60', '#cccccc'],
                    'fill-opacity': 0.5,
                    'fill-antialias': false,
                },
            });
        } else {
            const source = map.getSource(id) as GeoJSONSource;
            source.setData(geojson);
        }

        // Remove any previously bound events
        map.off('click', id, this._handleClick);

        // Add only click interaction
        map.on('click', id, this._handleClick);

        map.getCanvas().style.cursor = 'default';
    }

    /**
     * Removes the heatmap layer and its source from the map, if they exist.
     *
     * @param mapRef - A React ref to the MapLibre map instance
     */
    static removeHeatmapLayer(mapRef: React.RefObject<MapRef>) {
        const map = mapRef.current?.getMap();
        if (!map) return;

        const id = this.heatmapLayerId;
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);

        MapVisualHelper.removeIssuesPopup();
    }

    /**
     * Removes the issue popup if present on a heatmap.
     */
    static removeIssuesPopup() {
        if (MapVisualHelper.issuesPopup) {
            MapVisualHelper.issuesPopup.remove();
            MapVisualHelper.issuesPopup = null;
        }
    }

    /**
     * Extracts the "issue" field from a polygon feature.
     *
     * @param feature - A GeoJSON feature to extract issues from
     * @returns A string array for an issue description (can be empty)
     */
    private static _parseIssueFromFeature(feature: Feature): string[] {
        const issue = feature.properties?.issue;
        return issue ? [issue] : [];
    }

    /**
     * Shows a popup when a polygon is clicked, listing all issues.
     *
     * @param e - Click event with feature context
     */
    private static _handleClick(e: FeatureEvent) {
        const map = e.target as Map;
        const features = e.features ?? [];
        if (features.length === 0) return;

        // Collect and flatten all issues from every feature, then de-duplicate.
        const allIssues = features.flatMap((feature) => MapVisualHelper._parseIssueFromFeature(feature));
        const uniqueIssues = Array.from(new Set(allIssues));
        const count = uniqueIssues.length;

        // Build the HTML
        const html = `
            <div style="max-width: 250px;">
                <div style="font-weight: bold;">
                    ${count === 0 ? 'No issues found' : `${count} issue${count > 1 ? 's' : ''} found`}
                </div>
                ${count > 0 ? uniqueIssues.map((issue) => `<div style="margin-bottom: 4px;">${issue}</div>`).join('') : ''}
            </div>
        `;

        MapVisualHelper.removeIssuesPopup();
        MapVisualHelper.issuesPopup = new Popup({ closeButton: true }).setLngLat(e.lngLat).setHTML(html).addTo(map);
    }

    /**
     * Hides all non-base layers on the map and returns the IDs of those hidden layers.
     * Base layers are identified by names like 'background', 'tile', or 'basemap'.
     *
     * @param map - The MapLibre map instance
     * @returns An array of layer IDs that were hidden
     */
    static hideNonBaseLayers(map: Map): string[] {
        const allLayerIds = map.getStyle().layers?.map((layer) => layer.id) || [];
        const layersToHide = allLayerIds.filter((id) => id.startsWith('gl-') || id === MapVisualHelper.heatmapLayerId || id == MapVisualHelper.maskLayerId);

        const toHide = allLayerIds.filter((id) => layersToHide.includes(id));
        toHide.forEach((id) => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'none');
            }
        });

        MapVisualHelper.removeIssuesPopup();

        return toHide;
    }

    /**
     * Restores visibility for previously hidden layers.
     *
     * @param map - The MapLibre map instance
     * @param layerIds - Array of layer IDs to show
     */
    static showLayers(map: Map, layerIds: string[]) {
        layerIds.forEach((id) => {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', 'visible');
            }
        });
    }
}
