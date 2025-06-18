import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapVisualHelper } from './MapVisualHelper'; // Adjust path as needed
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
      coordinates: [[[1, 1], [5, 1], [5, 5], [1, 5], [1, 1]]],
    };

    map.getSource.mockReturnValue(undefined);
    map.getLayer.mockReturnValue(undefined);

    MapVisualHelper.applyDimmedMaskAndPanToPolygon(map, polygon);

    expect(map.addSource).toHaveBeenCalled();
    expect(map.addLayer).toHaveBeenCalled();
    expect(map.fitBounds).toHaveBeenCalledWith(
      [[1, 1], [5, 5]],
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
      coordinates: [[[1, 1], [5, 1], [3, 6], [1, 1]]],
    };

    const [lng, lat] = MapVisualHelper.getConfirmationPopupCoordinates(polygon);
    expect(lng).toBeCloseTo((1 + 5 + 3 + 1) / 4);
    expect(lat).toBeCloseTo(6.005); // 6 is topLat, plus 0.005 offset
  });
});
