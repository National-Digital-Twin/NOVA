import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapVisualHelper } from './MapVisualHelper';
import type { Polygon } from 'geojson';

// Create a mock MapLibre GL map
const createMockMap = () => {
    return {
        getSource: vi.fn(),
        addSource: vi.fn(),
        getLayer: vi.fn(),
        addLayer: vi.fn(),
        fitBounds: vi.fn(),
        removeLayer: vi.fn(),
        removeSource: vi.fn(),
    } as any; // Simulate the Map type
};

describe('MapVisualHelper', () => {
    let map: any;

    beforeEach(() => {
        map = createMockMap();
    });

    it('adds mask layer and fits map to polygon', () => {
        const polygon: Polygon = {
            type: 'Polygon',
            coordinates: [
                [
                    [1, 1],
                    [5, 1],
                    [5, 5],
                    [1, 5],
                    [1, 1],
                ],
            ],
        };

        map.getSource.mockReturnValue(undefined);
        map.getLayer.mockReturnValue(undefined);

        MapVisualHelper.applyDimmedMaskAndPanToPolygon(map, polygon);

        expect(map.addSource).toHaveBeenCalled();
        expect(map.addLayer).toHaveBeenCalled();
        expect(map.fitBounds).toHaveBeenCalledWith(
            [
                [1, 1],
                [5, 5],
            ],
            expect.objectContaining({
                padding: expect.objectContaining({
                    left: 450,
                    right: 66,
                }),
                duration: 2000,
            })
        );
    });

    it('removes existing mask layer and source', () => {
        map.getLayer.mockReturnValue(true);
        map.getSource.mockReturnValue(true);

        MapVisualHelper.removeDimmedMask(map);

        expect(map.removeLayer).toHaveBeenCalledWith('mask-layer');
        expect(map.removeSource).toHaveBeenCalledWith('mask');
    });

    it('calculates popup coordinates correctly', () => {
        const polygon: Polygon = {
            type: 'Polygon',
            coordinates: [
                [
                    [1, 1],
                    [5, 1],
                    [3, 6],
                    [1, 1],
                ],
            ],
        };

        const [lng, lat] = MapVisualHelper.getConfirmationPopupCoordinates(polygon);
        expect(lng).toBeCloseTo((1 + 5 + 3 + 1) / 4);
        expect(lat).toBeCloseTo(6.005); // 6 is topLat, plus 0.005 offset
    });

    it('removes existing popup if it exists', () => {
        const mockRemove = vi.fn();
        const popupRef = { current: { remove: mockRemove } };

        MapVisualHelper.removeExistingPopup(popupRef as any);

        expect(mockRemove).toHaveBeenCalled();
        expect(popupRef.current).toBeNull();
    });

    it('flyToLocation flies to correct coordinates', () => {
        const flyTo = vi.fn();
        const getMap = () => ({ flyTo });
        const mapRef = { current: { getMap } };

        MapVisualHelper.flyToLocation(mapRef as any, 10, 20, 5);

        expect(flyTo).toHaveBeenCalledWith({
            center: [20, 10],
            zoom: 5,
            duration: 2000,
        });
    });

    it('flyToLocation does nothing if mapRef is null', () => {
        const mapRef = { current: null };
        expect(() => {
            MapVisualHelper.flyToLocation(mapRef as any, 10, 20, 5);
        }).not.toThrow();
    });

    it('gets the first polygon if present', () => {
        const draw = {
            getAll: () => ({
                features: [{ geometry: { type: 'Polygon', coordinates: [[[0, 0]]] } }],
            }),
        };

        const result = MapVisualHelper.getFirstPolygon(draw as any);
        expect(result?.type).toBe('Polygon');
    });

    it('returns null if no polygon is found in draw', () => {
        const draw = {
            getAll: () => ({
                features: [{ geometry: { type: 'Point', coordinates: [0, 0] } }],
            }),
        };

        const result = MapVisualHelper.getFirstPolygon(draw as any);
        expect(result).toBeNull();
    });

    it('extracts the first polygon from geojson', () => {
        const geojson = {
            type: 'FeatureCollection',
            features: [{ geometry: { type: 'Polygon', coordinates: [[[0, 0]]] } }],
        };

        const result = MapVisualHelper.extractFirstPolygon(geojson as any);
        expect(result?.type).toBe('Polygon');
    });

    it('returns null if first geometry is not a polygon', () => {
        const geojson = {
            type: 'FeatureCollection',
            features: [
                {
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [0, 0],
                            [1, 1],
                        ],
                    },
                },
            ],
        };

        const result = MapVisualHelper.extractFirstPolygon(geojson as any);
        expect(result).toBeNull();
    });

    it('gets the full feature collection from draw', () => {
        const mockCollection = { type: 'FeatureCollection', features: [] };
        const draw = { getAll: () => mockCollection };

        const result = MapVisualHelper.getFeatureCollection(draw as any);
        expect(result).toEqual(mockCollection);
    });
});
