import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { MapLayerMouseEvent, Popup } from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import { create } from 'zustand';
import type { Variation } from '../components/search/add-asset/AddAsset';
import type { FeatureCollection } from 'geojson';

export type PolygonStatus = 'none' | 'drawing' | 'editing' | 'pendingConfirmation' | 'confirmed';

interface MapState {
    mapRef: MapRef | null;
    setMapRef: (ref: MapRef) => void;

    drawRef: MapboxDraw | null;
    setDrawRef: (ref: MapboxDraw) => void;

    polygonConfirmPopup: Popup | null;
    setPolygonConfirmPopup: (ref: Popup | null) => void;

    placing: boolean;
    setPlacing: (placing: boolean) => void;

    markerPosition: { longitude?: number; latitude?: number } | null;
    setMarkerPosition: (position: { longitude?: number; latitude?: number } | null) => void;

    markerBearing: number | null;
    setMarkerBearing: (bearing: number) => void;

    markerVariant: Variation | null;
    setMarkerVariant: (variant: Variation | null) => void;

    preventPolygonEdit: (e: MouseEvent) => void;
    handleMapClick: (e: MapLayerMouseEvent) => void;

    cachedHeatmap: FeatureCollection | null;
    setCachedHeatmap: (featureCollection: FeatureCollection | null) => void;

    polygonStatus: PolygonStatus;
    setPolygonStatus: (status: PolygonStatus) => void;

    clearMarkerValues: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
    mapRef: null,
    setMapRef: (ref) => set({ mapRef: ref }),

    drawRef: null,
    setDrawRef: (ref) => set({ drawRef: ref }),

    polygonConfirmPopup: null,
    setPolygonConfirmPopup: (popup) => set({ polygonConfirmPopup: popup }),

    placing: false,
    setPlacing: (placing) => set({ placing: placing }),

    markerPosition: null,
    setMarkerPosition: (position) => set({ markerPosition: position }),
    markerBearing: null,
    setMarkerBearing: (bearing) => set({ markerBearing: bearing }),
    markerVariant: null,
    setMarkerVariant: (variant) => set({ markerVariant: variant }),

    cachedHeatmap: null,
    setCachedHeatmap: (featureCollection) => set({ cachedHeatmap: featureCollection }),

    polygonStatus: 'none',
    setPolygonStatus: (status) => set({ polygonStatus: status }),

    clearMarkerValues: () => set({markerBearing: null, markerVariant: null, markerPosition: null}),

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
