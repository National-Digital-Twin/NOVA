import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import { create } from 'zustand';
import type { Variation } from '../components/search/add-asset/AddAsset';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { Substation } from '../components/map-substations-list/SubstationsList';
import { MarkerStatus } from '../components/asset-marker/AssetMarker';

interface MapState {
    mapRef: MapRef | null;
    setMapRef: (ref: MapRef) => void;

    drawRef: MapboxDraw | null;
    setDrawRef: (ref: MapboxDraw) => void;

    showLayerControl: boolean;
    setShowLayerControl: (layerControl: boolean) => void;

    placing: boolean;
    setPlacing: (placing: boolean) => void;

    markerPosition: { longitude?: number; latitude?: number } | null;
    setMarkerPosition: (position: { longitude?: number; latitude?: number } | null) => void;
    markerBearing: number | null;
    setMarkerBearing: (bearing: number) => void;
    markerVariant: Variation | null;
    setMarkerVariant: (variant: Variation | null) => void;
    markerStatus: MarkerStatus;
    setMarkerStatus: (status: MarkerStatus) => void;

    preventPolygonEdit: (e: MouseEvent) => void;
    handleMapClick: (e: MapLayerMouseEvent) => void;

    cachedHeatmap: FeatureCollection | null;
    setCachedHeatmap: (featureCollection: FeatureCollection | null) => void;

    maskLayerId: string | null,
    setMaskLayerId: (id: string) => void;
    maskLayerSourceId: string | null,
    setMaskLayerSourceId: (id: string) => void;

    flyToLocation: (lat: number, lng: number, zoom: number, duration?: number) => void;
    applyDimmedMaskToMap: () => void;

    gridConnectViewActive: boolean,
    setGridConnectViewActive: (active: boolean) => void;
    
    selectedSubstation: Substation | null,
    setSelectedSubstation: (substation: Substation) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
    mapRef: null,
    setMapRef: (ref) => set({ mapRef: ref }),

    drawRef: null,
    setDrawRef: (ref) => set({ drawRef: ref }),

    showLayerControl: false,
    setShowLayerControl: (layerControl) => set({showLayerControl: layerControl}),

    placing: false,
    setPlacing: (placing) => set({ placing: placing }),

    markerPosition: null,
    setMarkerPosition: (position) => set({ markerPosition: position }),
    markerBearing: null,
    setMarkerBearing: (bearing) => set({ markerBearing: bearing }),
    markerVariant: null,
    setMarkerVariant: (variant) => set({ markerVariant: variant }),
    markerStatus: MarkerStatus.Draft,
    setMarkerStatus: (status) => set({ markerStatus: status }),

    gridConnectViewActive: false,
    setGridConnectViewActive: (active) => set({ gridConnectViewActive: active }),
    
    selectedSubstation: null,
    setSelectedSubstation: (substation) => set({ selectedSubstation: substation }),

    cachedHeatmap: null,
    setCachedHeatmap: (featureCollection) => set({ cachedHeatmap: featureCollection }),

    maskLayerId: null,
    setMaskLayerId: (id) => set({maskLayerId: id}),
    maskLayerSourceId: null,
    setMaskLayerSourceId: (id) => set({maskLayerSourceId: id}),
    
    /**
     * Flies the map to a specific location with a smooth animation.
     *
     * @param mapRef - A React ref to the MapLibre map instance
     * @param lat - Latitude of the target location
     * @param lng - Longitude of the target location
     * @param zoom - Zoom level for the target location
     * @param duration - Duration of the flyTo animation in milliseconds (default is 2000ms)
     */
    flyToLocation(lat: number, lng: number, zoom: number, duration = 2000) {
        const mapRef = get().mapRef;
        const map = mapRef?.getMap();

        if (!map) return;
        map.flyTo({ center: [lng, lat], zoom, duration });
    },

    applyDimmedMaskToMap: () => {
        const mapRef = get().mapRef;
        const maskLayerId = get().maskLayerId;
        const maskLayerSourceId = get().maskLayerSourceId;
        if (!mapRef || !maskLayerId || !maskLayerSourceId) return;
        const map = mapRef.getMap();
        
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
                    // polygon.coordinates[0],
                ],
            },
            properties: {},
        };

        if (!map.getSource(maskLayerSourceId)) {
            map.addSource(maskLayerSourceId, {
                type: 'geojson',
                data: maskFeature,
            });
        } else {
            const source = map.getSource(maskLayerSourceId) as GeoJSONSource;
            source.setData(maskFeature);
        }

        if (!map.getLayer(maskLayerId)) {
            map.addLayer({
                id: maskLayerId,
                type: 'fill',
                source: maskLayerSourceId,
                paint: {
                    'fill-color': '#000000',
                    'fill-opacity': 0.5,
                },
            });
        }
    },

    preventPolygonEdit: (e: MouseEvent | ({ point?: { x: number; y: number } } & MouseEvent)) => {
        let x: number;
        let y: number;

        if ('point' in e && e.point && typeof e.point.x === 'number' && typeof e.point.y === 'number') {
            // TypeScript now knows e.point has x and y
            x = e.point.x;
            y = e.point.y;
        } else {
            x = e.clientX;
            y = e.clientY;
        }

        const map = get().mapRef;
        const draw = get().drawRef;
        if (map && draw) {
            const mode = draw.getMode();
            if (mode.startsWith('draw')) return;

            const features = map.queryRenderedFeatures([x, y], {
                layers: ['gl-draw-polygon-fill.cold'],
            });

            if (features.length > 0) {
                draw.changeMode('simple_select', { featureIds: [] });
                e.preventDefault();
            }
        }
    },

    handleMapClick: (e: MapLayerMouseEvent) => {
        // handle state when asset is being placed
        if (get().placing) {
            const { lngLat } = e;
            get().setMarkerPosition({ longitude: lngLat.lng, latitude: lngLat.lat });

            // set bearing
            const mapRef = get().mapRef;
            if (mapRef) {
                get().setMarkerBearing(mapRef.getBearing());
            }

            get().setPlacing(false);
        }
    },
}));
