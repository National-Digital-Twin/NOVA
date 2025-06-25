import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import Point from '@mapbox/point-geometry';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import { create } from 'zustand';

interface MapState {
  mapRef: MapRef | null;
  setMapRef: (ref: MapRef) => void;

  drawRef: MapboxDraw | null;
  setDrawRef: (ref: MapboxDraw) => void;

  placing: boolean;
  setPlacing: (placing: boolean) => void;

  markerPosition: { longitude?: number; latitude?: number; } | null;
  setMarkerPosition: (position: { longitude?: number; latitude?: number; } | null) => void;
  
  preventPolygonEdit: (e: MouseEvent) => void;
  handleMapClick: (e: MapLayerMouseEvent) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  mapRef: null,
  setMapRef: (ref) => set({ mapRef: ref }),

  drawRef: null,
  setDrawRef: (ref) => set({ drawRef: ref }),

  placing: false,
  setPlacing: (placing) => set({placing: placing}),

  markerPosition: null,
  setMarkerPosition: (position) => set({markerPosition: position}),

  preventPolygonEdit: (e: MouseEvent) => {
    let x: number;
    let y: number;

    if ('point' in e && e.point && typeof e.point.x === 'number') {
        // It's a MapMouseEvent
        x = e.point.x;
        y = e.point.y;
    } else {
        // It's a DOM MouseEvent
        x = e.clientX;
        y = e.clientY;
    }

    const map = get().mapRef;
    const draw = get().drawRef;
    if (map && draw) {
        const mode = draw.getMode();
        if (mode.startsWith('draw')) {
            return;
        }

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
        get().setPlacing(false);
    }
  }
}));
