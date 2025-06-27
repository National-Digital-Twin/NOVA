import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePolygonHandlers } from './usePolygonHandlers';
import { MapVisualHelper } from '../utils/MapVisualHelper';
import type { FeatureCollection, Polygon } from 'geojson';
import type { MapRef } from 'react-map-gl/maplibre';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';

vi.mock('../stores/useMapStore', () => {
  const setPolygonConfirmPopup = vi.fn();
  const setPolygonStatus = vi.fn();
  const setCachedHeatmap = vi.fn();
  const clearMarkerValues = vi.fn();

  return {
    useMapStore: (selector: any) =>
      selector({
        polygonStatus: 'none',
        setPolygonConfirmPopup,
        setPolygonStatus,
        setCachedHeatmap,
        clearMarkerValues,
      }),
    useMapStoreApi: {
      getState: () => ({
        polygonConfirmPopup: {},
        setCachedHeatmap,
      }),
    },
  };
});

vi.mock('maplibre-gl', async () => {
  const actual = await vi.importActual<any>('maplibre-gl');
  return {
    ...actual,
    Popup: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setDOMContent: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
    })),
  };
});

vi.mock('react-dom/client', () => ({
  createRoot: () => ({
    render: vi.fn(),
  }),
}));

vi.mock('../utils/MapVisualHelper', () => ({
  MapVisualHelper: {
    extractFirstPolygon: vi.fn(),
    applyDimmedMaskAndPanToPolygon: vi.fn(),
    getConfirmationPopupCoordinates: vi.fn().mockReturnValue([0, 0]),
    removeDimmedMask: vi.fn(),
    removeExistingPopup: vi.fn(),
    removeHeatmapLayer: vi.fn(),
    getFeatureCollection: vi.fn().mockReturnValue({ type: 'FeatureCollection', features: [] }),
    getFirstPolygon: vi.fn(),
    remove3DAssets: vi.fn(),
  },
}));

const fakePolygon: Polygon = {
  type: 'Polygon',
  coordinates: [[[0, 0], [1, 1], [2, 2], [0, 0]]],
};

const geojson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: fakePolygon,
      properties: {},
    },
  ],
};

const createMockMapRef = (): React.RefObject<MapRef> =>
  ({
    current: {
      getMap: () => ({
        on: vi.fn(),
        once: vi.fn(),
        off: vi.fn(),
        getCanvas: vi.fn(),
      }),
    },
  }) as unknown as React.RefObject<MapRef>;

const createMockDrawRef = (): React.RefObject<MapboxDraw> =>
  ({
    current: {
      getMode: vi.fn().mockReturnValue('simple_select'),
      getAll: vi.fn().mockReturnValue(geojson),
      changeMode: vi.fn(),
      deleteAll: vi.fn(),
    },
  }) as unknown as React.RefObject<MapboxDraw>;

describe('usePolygonHandlers', () => {
  let mapRef: React.RefObject<MapRef>;
  let drawRef: React.RefObject<MapboxDraw>;

  beforeEach(() => {
    vi.clearAllMocks();
    mapRef = createMockMapRef();
    drawRef = createMockDrawRef();
  });

  it('does not show popup if polygon not found', () => {
    (MapVisualHelper.extractFirstPolygon as any).mockReturnValue(null);

    const { result } = renderHook(() => usePolygonHandlers({ mapRef, drawRef }));
    act(() => {
      result.current.handlePolygonDrawn(geojson);
    });

    expect(MapVisualHelper.getConfirmationPopupCoordinates).not.toHaveBeenCalled();
  });

  it('starts drawing mode if no polygon exists', () => {
    (MapVisualHelper.getFirstPolygon as any).mockReturnValue(null);

    const { result } = renderHook(() => usePolygonHandlers({ mapRef, drawRef }));
    act(() => {
      result.current.startPolygonDraw();
    });

    expect(drawRef.current.changeMode).toHaveBeenCalledWith('draw_polygon');
  });

  it('does not start drawing mode if already in draw mode', () => {
    drawRef.current.getMode = vi.fn().mockReturnValue('draw_polygon');
    const { result } = renderHook(() => usePolygonHandlers({ mapRef, drawRef }));

    act(() => {
      result.current.startPolygonDraw();
    });

    expect(drawRef.current.changeMode).not.toHaveBeenCalled();
  });

  it('deletes polygon and resets store on delete', () => {
    const { result } = renderHook(() => usePolygonHandlers({ mapRef, drawRef }));
    act(() => {
      result.current.handlePolygonDeleted();
    });

    expect(drawRef.current.deleteAll).toHaveBeenCalled();
    expect(MapVisualHelper.removeDimmedMask).toHaveBeenCalled();
    expect(MapVisualHelper.removeExistingPopup).toHaveBeenCalled();
    expect(MapVisualHelper.removeHeatmapLayer).toHaveBeenCalled();
    expect(MapVisualHelper.remove3DAssets).toHaveBeenCalled();
  });

  it('starts edit mode if polygon exists', () => {
    (MapVisualHelper.getFirstPolygon as any).mockReturnValue(fakePolygon);
    (MapVisualHelper.getFeatureCollection as any).mockReturnValue({
      type: 'FeatureCollection',
      features: [{ id: 'poly-1', geometry: fakePolygon, type: 'Feature', properties: {} }],
    });

    const { result } = renderHook(() => usePolygonHandlers({ mapRef, drawRef }));
    act(() => {
      result.current.startPolygonEdit();
    });

    expect(drawRef.current.changeMode).toHaveBeenCalledWith('direct_select', { featureId: 'poly-1' });
  });

  it('confirms polygon and applies mask', () => {
    (MapVisualHelper.extractFirstPolygon as any).mockReturnValue(fakePolygon);
    const { result } = renderHook(() => usePolygonHandlers({ mapRef, drawRef }));

    act(() => {
      result.current.handlePolygonConfirmed(geojson);
    });

    expect(MapVisualHelper.applyDimmedMaskAndPanToPolygon).toHaveBeenCalled();
  });

  it('edits polygon and removes 3D assets', () => {
    (MapVisualHelper.extractFirstPolygon as any).mockReturnValue(fakePolygon);
    const { result } = renderHook(() => usePolygonHandlers({ mapRef, drawRef }));

    act(() => {
      result.current.handlePolygonEdited(geojson);
    });

    expect(MapVisualHelper.applyDimmedMaskAndPanToPolygon).toHaveBeenCalled();
    expect(MapVisualHelper.remove3DAssets).toHaveBeenCalled();
  });
});
