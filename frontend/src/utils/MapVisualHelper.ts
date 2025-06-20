import { LngLat, MapMouseEvent, type Map, Popup } from 'maplibre-gl';
import type { Feature, FeatureCollection, Geometry, Polygon } from 'geojson';
import type { GeoJSONSource } from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';

// Used to ensure mouse events include feature information
type FeatureEvent = MapMouseEvent & {
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
        return feature?.geometry?.type === 'Polygon' ? feature.geometry as Polygon : null;
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
        return geometry?.type === 'Polygon' ? geometry as Polygon : null;
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
     * Also adds interactivity for hover (issue count) and click (issue descriptions).
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
                    'fill-color': [
                        'match',
                        ['get', 'suitability'],
                        'red', '#e74c3c',
                        'amber', '#f39c12',
                        'green', '#27ae60',
                        '#cccccc'
                    ],
                    'fill-opacity': 0.5,
                },
            });
        } else {
            const source = map.getSource(id) as GeoJSONSource;
            source.setData(geojson);
        }

        // Remove old event listeners if present
        map.off('mousemove', id, this._handleMouseMove);
        map.off('mouseleave', id, this._handleMouseLeave);
        map.off('click', id, this._handleClick);

        // Add interactivity to layer
        map.on('mousemove', id, this._handleMouseMove);
        map.on('mouseleave', id, this._handleMouseLeave);
        map.on('click', id, this._handleClick);
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
    }

    /**
     * Extracts and normalises the "issues" array from a polygon feature.
     * Handles both array and stringified JSON input.
     *
     * @param feature - A GeoJSON feature to extract issues from
     * @returns A string array of issues (can be empty)
     */
    private static _parseIssues(feature: Feature): string[] {
        const raw = feature.properties?.issues;
        if (Array.isArray(raw)) return raw;
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    /**
     * Shows a live popup near the cursor when hovering over a polygon.
     * Displays the number of issues found in that feature.
     *
     * @param e - Mouse move event with feature context
     */
    private static _handleMouseMove(e: FeatureEvent) {
        const map = e.target as Map;
        map.getCanvas().style.cursor = 'pointer';

        const feature = e.features?.[0];
        if (!feature) return;

        const issues = MapVisualHelper._parseIssues(feature);
        const popupContent = `<strong>${issues.length} issue${issues.length === 1 ? '' : 's'} found</strong>`;

        if (!MapVisualHelper.issuesPopup) {
            MapVisualHelper.issuesPopup = new Popup({ closeButton: false, closeOnClick: false })
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
        } else {
            MapVisualHelper.issuesPopup.setLngLat(e.lngLat).setHTML(popupContent);
        }
    }

    /**
     * Hides the issue popup and resets the cursor when leaving a polygon.
     *
     * @param e - Mouse leave event
     */
    private static _handleMouseLeave(e: FeatureEvent) {
        const map = e.target as Map;
        map.getCanvas().style.cursor = '';
        if (MapVisualHelper.issuesPopup) {
            MapVisualHelper.issuesPopup.remove();
            MapVisualHelper.issuesPopup = null;
        }
    }

    /**
     * Shows a popup when a polygon is clicked, listing all issues in bold.
     *
     * @param e - Click event with feature context
     */
    private static _handleClick(e: FeatureEvent) {
        const map = e.target as Map;
        const feature = e.features?.[0];
        if (!feature) return;

        const issues = MapVisualHelper._parseIssues(feature);

        const html = issues.length > 0
        ? `<div style="
              display: inline-block;
              white-space: normal;
              overflow-wrap: break-word;
              word-break: break-word;
              padding: 4px 8px;
          ">
              ${issues.map(issue => `<div><strong>${issue}</strong></div>`).join('')}
           </div>`
        : '<strong>No issues found</strong>';

        if (MapVisualHelper.issuesPopup) MapVisualHelper.issuesPopup.remove();

        MapVisualHelper.issuesPopup = new Popup({ closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(map);
    }
}
