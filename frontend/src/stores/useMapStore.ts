import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Popup } from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import { create } from 'zustand';
import type { Asset, Variation } from '../components/search/add-asset/AddAsset';
import type { FeatureCollection } from 'geojson';

export type PolygonStatus = 'none' | 'drawing' | 'editing' | 'pendingConfirmation' | 'confirmed';

export interface MapState {
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

    cachedHeatmap: FeatureCollection | null;
    setCachedHeatmap: (featureCollection: FeatureCollection | null) => void;

    cachedAssets: Asset[] | null;
    setCachedAssets: (assets: Asset[] | null) => void;

    polygonStatus: PolygonStatus;
    setPolygonStatus: (status: PolygonStatus) => void;

    clearMarkerValues: () => void;
}

export const useMapStore = create<MapState>((set) => ({
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

    cachedAssets: null,
    setCachedAssets: (assets) => set({ cachedAssets: assets }),

    polygonStatus: 'none',
    setPolygonStatus: (status) => set({ polygonStatus: status }),

    clearMarkerValues: () => set({ markerBearing: null, markerVariant: null, markerPosition: null }),
}));
