import { renderHook } from '@testing-library/react';
import { usePolygonHandlers } from './usePolygonHandlers';
import { MapVisualHelper } from '../utils/MapVisualHelper';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeatureCollection, Geometry, Polygon } from 'geojson';
import { createMockMapRef } from '../../test/test-utils';

// Mock data
const fakePolygon: Polygon = {
    type: 'Polygon',
    coordinates: [
        [
            [0, 0],
            [1, 1],
            [2, 2],
            [0, 0],
        ],
    ],
};

const geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', geometry: fakePolygon, properties: {} }],
};

// Mocks
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

vi.mock('../utils/MapVisualHelper', () => ({
    MapVisualHelper: {
        extractFirstPolygon: vi.fn(),
        applyDimmedMaskAndPanToPolygon: vi.fn(),
        getConfirmationPopupCoordinates: vi.fn().mockReturnValue([0, 0]),
        removeDimmedMask: vi.fn(),
        removeExistingPopup: vi.fn(),
    },
}));

vi.mock('react-dom/client', () => ({
    createRoot: () => ({
        render: vi.fn(),
    }),
}));

describe('usePolygonHandlers', () => {
    let mapRef: any;
    let popupRef: any;
    const setPolygonDrawn = vi.fn();
    const setPolygonConfirmed = vi.fn();
    const showLayerControl = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mapRef = { current: createMockMapRef() };
        popupRef = { current: null };
    });

    it('skips confirmation popup if no polygon found', () => {
        (MapVisualHelper.extractFirstPolygon as any).mockReturnValue(null);

        const { result } = renderHook(() =>
            usePolygonHandlers({
                mapRef,
                popupRef,
                setPolygonDrawn,
                setPolygonConfirmed,
                showLayerControl,
            })
        );

        result.current.handlePolygonDrawn(geojson as FeatureCollection<Geometry>);
        expect(MapVisualHelper.getConfirmationPopupCoordinates).not.toHaveBeenCalled();
    });
});
