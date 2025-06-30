import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
import type { Popup } from 'maplibre-gl';
import type { MapRef } from 'react-map-gl/maplibre';
import { create } from 'zustand';
import type { Variation } from '../components/search/add-asset/AddAsset';
import type { FeatureCollection } from 'geojson';
import type { Substation } from '../components/map-substations-list/SubstationsList';
import { MarkerStatus } from '../components/asset-marker/AssetMarkerStatus';

export type PolygonStatus = 'none' | 'drawing' | 'editing' | 'pendingConfirmation' | 'confirmed';

export interface MapState {
    mapRef: MapRef | null;
    setMapRef: (ref: MapRef) => void;

    drawRef: MapboxDraw | null;
    setDrawRef: (ref: MapboxDraw) => void;

    showLayerControl: boolean;
    setShowLayerControl: (layerControl: boolean) => void;

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
    markerStatus: MarkerStatus;
    setMarkerStatus: (status: MarkerStatus) => void;

    cachedHeatmap: FeatureCollection | null;
    setCachedHeatmap: (featureCollection: FeatureCollection | null) => void;

    flyToLocation: (lat: number, lng: number, zoom: number, duration?: number) => void;

    gridConnectViewActive: boolean;
    setGridConnectViewActive: (active: boolean) => void;

    selectedSubstation: Substation | null;
    setSelectedSubstation: (substation: Substation | null) => void;
    setSelectedSubstationById: (substationId: number) => void;

    substations: Substation[];
    setSubstations: (substations: Substation[]) => void;

    renderGridConnectionLine: (connectionLineLayerId: string, lineColor: string) => void;

    polygonStatus: PolygonStatus;
    setPolygonStatus: (status: PolygonStatus) => void;

    clearMarkerValues: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
    mapRef: null,
    setMapRef: (ref) => set({ mapRef: ref }),

    drawRef: null,
    setDrawRef: (ref) => set({ drawRef: ref }),

    showLayerControl: false,
    setShowLayerControl: (layerControl) => set({ showLayerControl: layerControl }),

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
    markerStatus: MarkerStatus.Draft,
    setMarkerStatus: (status) => set({ markerStatus: status }),

    gridConnectViewActive: false,
    setGridConnectViewActive: (active) => set({ gridConnectViewActive: active }),

    substations: [],
    setSubstations: (substations) => set({ substations: substations }),

    selectedSubstation: null,
    setSelectedSubstation: (substation) => set({ selectedSubstation: substation }),
    setSelectedSubstationById: (substationId) =>
        set((state) => {
            const substations = state.substations.filter((substation) => substation.id === substationId);
            if (substations.length > 1) throw new Error(`Duplicate ID found for substation ${substationId}`);
            return { selectedSubstation: substations[0] };
        }),

    cachedHeatmap: null,
    setCachedHeatmap: (featureCollection) => set({ cachedHeatmap: featureCollection }),

    polygonStatus: 'none',
    setPolygonStatus: (status) => set({ polygonStatus: status }),

    clearMarkerValues: () => set({ markerBearing: null, markerVariant: null, markerPosition: null }),

    renderGridConnectionLine: (connectionLineLayerId: string, lineColor: string) => {
        const map = get().mapRef?.getMap();
        const markerPosition = get().markerPosition;
        const selectedSubstation = get().selectedSubstation;
        if (!map || !markerPosition || !markerPosition.longitude || !markerPosition.latitude || !selectedSubstation || !selectedSubstation.coordinates) return;
        const layerId = connectionLineLayerId;
        const data = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: [[markerPosition.longitude, markerPosition.latitude], selectedSubstation.coordinates],
            },
        };

        if (map.getSource(layerId)) {
            const source = map.getSource(layerId) as GeoJSONSource;
            source.setData(data);
        } else {
            map.addSource(layerId, {
                type: 'geojson',
                data: data,
            });

            // Add a layer to display the path
            map.addLayer({
                id: connectionLineLayerId,
                type: 'line',
                source: connectionLineLayerId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': lineColor,
                    'line-width': 2,
                    'line-dasharray': [2, 2],
                },
            });
        }
    },

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
