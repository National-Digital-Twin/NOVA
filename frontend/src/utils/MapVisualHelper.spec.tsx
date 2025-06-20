import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapVisualHelper } from './MapVisualHelper';
import type { FeatureCollection, Polygon } from 'geojson';
import { Popup } from 'maplibre-gl';

const createMockMap = () => {
    const listeners: Record<string, Function[]> = {};

    return {
        getSource: vi.fn(),
        addSource: vi.fn(),
        getLayer: vi.fn(),
        addLayer: vi.fn(),
        fitBounds: vi.fn(),
        removeLayer: vi.fn(),
        removeSource: vi.fn(),
        setLayoutProperty: vi.fn(),
        getStyle: vi.fn(() => ({
            layers: [
                { id: 'background' },
                { id: 'basemap' },
                { id: 'heatmap-layer' },
                { id: 'gl-custom-layer' }
            ]
        })),
        on: vi.fn((event, cb) => {
            listeners[event] = listeners[event] || [];
            listeners[event].push(cb);
        }),
        off: vi.fn((event, cb) => {
            listeners[event] = (listeners[event] || []).filter(fn => fn !== cb);
        }),
        fire: (event: string) => {
            (listeners[event] || []).forEach(fn => fn());
        },
        project: vi.fn(() => ({ x: 100, y: 100 })),
        unproject: vi.fn(() => ({ lng: 3, lat: 6.005 })),
        getCanvas: () => ({ style: { cursor: '' } }),
        flyTo: vi.fn(),
        setCenter: vi.fn()
    };
};

describe('MapVisualHelper', () => {
    let map: any;

    beforeEach(() => {
        map = createMockMap();
    });

    it('applyDimmedMaskAndPanToPolygon adds mask and pans', () => {
        const polygon: Polygon = {
            type: 'Polygon',
            coordinates: [[[1, 1], [5, 1], [5, 5], [1, 5], [1, 1]]]
        };
        map.getSource.mockReturnValue(undefined);
        map.getLayer.mockReturnValue(undefined);
        MapVisualHelper.applyDimmedMaskAndPanToPolygon(map, polygon);
        expect(map.addSource).toHaveBeenCalled();
        expect(map.addLayer).toHaveBeenCalled();
        expect(map.fitBounds).toHaveBeenCalled();
    });

    it('removeDimmedMask removes mask layer and source', () => {
        map.getLayer.mockReturnValue(true);
        map.getSource.mockReturnValue(true);
        MapVisualHelper.removeDimmedMask(map);
        expect(map.removeLayer).toHaveBeenCalledWith('mask-layer');
        expect(map.removeSource).toHaveBeenCalledWith('mask');
    });

    it('getConfirmationPopupCoordinates calculates offset location', () => {
        const polygon: Polygon = {
            type: 'Polygon',
            coordinates: [[[1, 1], [5, 1], [3, 6], [1, 1]]]
        };
        const result = MapVisualHelper.getConfirmationPopupCoordinates(polygon, map);
        expect(map.project).toHaveBeenCalled();
        expect(map.unproject).toHaveBeenCalled();
        expect(result).toEqual([3, 6.005]);
    });

    it('removeExistingPopup removes popup if present', () => {
        const mockRemove = vi.fn();
        const popupRef = { current: { remove: mockRemove } };
        MapVisualHelper.removeExistingPopup(popupRef as any);
        expect(mockRemove).toHaveBeenCalled();
        expect(popupRef.current).toBeNull();
    });

    it('flyToLocation calls flyTo', () => {
        const mapRef = { current: { getMap: () => map } };
        MapVisualHelper.flyToLocation(mapRef as any, 10, 20, 5);
        expect(map.flyTo).toHaveBeenCalledWith({ center: [20, 10], zoom: 5, duration: 2000 });
    });

    it('getFirstPolygon returns polygon', () => {
        const draw = { getAll: () => ({ features: [{ geometry: { type: 'Polygon', coordinates: [] } }] }) };
        expect(MapVisualHelper.getFirstPolygon(draw as any)?.type).toBe('Polygon');
    });

    it('getFirstPolygon returns null for non-polygon', () => {
        const draw = { getAll: () => ({ features: [{ geometry: { type: 'Point', coordinates: [0, 0] } }] }) };
        expect(MapVisualHelper.getFirstPolygon(draw as any)).toBeNull();
    });

    it('extractFirstPolygon returns polygon', () => {
        const geojson: FeatureCollection = { type: 'FeatureCollection', features: [{
            geometry: { type: 'Polygon', coordinates: [] },
            type: 'Feature',
            properties: null
        }] };
        expect(MapVisualHelper.extractFirstPolygon(geojson)).not.toBeNull();
    });

    it('extractFirstPolygon returns null for invalid type', () => {
        const geojson: FeatureCollection = { type: 'FeatureCollection', features: [{
            geometry: { type: 'LineString', coordinates: [] },
            type: 'Feature',
            properties: null
        }] };
        expect(MapVisualHelper.extractFirstPolygon(geojson)).toBeNull();
    });

    it('getFeatureCollection returns feature collection', () => {
        const mockCollection = { type: 'FeatureCollection', features: [] };
        const draw = { getAll: () => mockCollection };
        expect(MapVisualHelper.getFeatureCollection(draw as any)).toEqual(mockCollection);
    });

    it('hideNonBaseLayers hides correct layers', () => {
        map.getLayer.mockReturnValue(true);
        const result = MapVisualHelper.hideNonBaseLayers(map);
        expect(result).toContain('heatmap-layer');
        expect(map.setLayoutProperty).toHaveBeenCalled();
    });

    it('showLayers sets visibility for layers', () => {
        map.getLayer.mockReturnValue(true);
        MapVisualHelper.showLayers(map, ['layer-1', 'layer-2']);
        expect(map.setLayoutProperty).toHaveBeenCalledTimes(2);
    });

    it('addOrUpdateHeatmapLayer adds source and layer', () => {
        const mapRef = { current: { getMap: () => map } };
        map.getSource.mockReturnValue(undefined);
        MapVisualHelper.addOrUpdateHeatmapLayer(mapRef as any, {
            type: 'FeatureCollection',
            features: [],
        });
        expect(map.addSource).toHaveBeenCalled();
        expect(map.addLayer).toHaveBeenCalled();
    });

    it('removeHeatmapLayer removes source, layer and popup', () => {
        const mapRef = { current: { getMap: () => map } };
        map.getSource.mockReturnValue(true);
        map.getLayer.mockReturnValue(true);
        MapVisualHelper.removeHeatmapLayer(mapRef as any);
        expect(map.removeLayer).toHaveBeenCalledWith('heatmap-layer');
        expect(map.removeSource).toHaveBeenCalledWith('heatmap-layer');
    });

    it('removeHeatmapLayer does nothing if no popup', () => {
        (MapVisualHelper as any).issuesPopup = null;
    
        map.getLayer.mockReturnValue(true);
        map.getSource.mockReturnValue(true);
    
        const mapRef = { current: { getMap: () => map } };
        MapVisualHelper.removeHeatmapLayer(mapRef as any);
    
        expect(map.removeLayer).toHaveBeenCalledWith('heatmap-layer');
        expect(map.removeSource).toHaveBeenCalledWith('heatmap-layer');
    });

    it('_parseIssues handles invalid JSON gracefully', () => {
        const feature = { properties: { issues: 'not-json' } };
        const result = (MapVisualHelper as any)._parseIssues(feature);
        expect(result).toEqual([]);
    });
});
