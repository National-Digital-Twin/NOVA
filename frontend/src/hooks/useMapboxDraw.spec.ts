import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { renderHook } from '@testing-library/react';
import type { MapRef } from 'react-map-gl/maplibre';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useMapboxDraw from './useMapboxDraw';

vi.mock('@mapbox/mapbox-gl-draw');

describe('useMapboxDraw', () => {
    const mockMap = {
        current: {
            getMap: vi.fn().mockReturnValue({
                addControl: vi.fn(),
                removeControl: vi.fn(),
            }),
        },
    } as unknown as React.RefObject<MapRef>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not initialize if mapRef.current is null', () => {
        const nullMapRef = { current: null } as unknown as React.RefObject<MapRef>;
        const { result } = renderHook(() => useMapboxDraw(nullMapRef));
        expect(result.current.current).toBeNull();
    });

    it('should not initialize if mapRef.current.getMap() returns null', () => {
        const mockMapWithNullGetMap = {
            current: {
                getMap: vi.fn().mockReturnValue(null),
            },
        } as unknown as React.RefObject<MapRef>;
        const { result } = renderHook(() => useMapboxDraw(mockMapWithNullGetMap));
        expect(result.current.current).toBeNull();
    });

    it('should initialize draw control when map is initialized', () => {
        const { result } = renderHook(() => useMapboxDraw(mockMap));
        expect(MapboxDraw).toHaveBeenCalledWith({
            displayControlsDefault: false,
            styles: expect.any(Array),
            touchEnabled: true,
            touchMoveThreshold: 3,
            clickBuffer: 3,
            keybindings: false,
            boxSelect: false,
            touchPitch: false,
            mode: 'simple_select',
        });
        expect(result.current.current).toBeInstanceOf(MapboxDraw);
    });

    it('should cleanup draw control on unmount', () => {
        const { unmount } = renderHook(() => useMapboxDraw(mockMap));
        const map = mockMap.current?.getMap();

        unmount();

        expect(map?.removeControl).toHaveBeenCalled();
    });
});
