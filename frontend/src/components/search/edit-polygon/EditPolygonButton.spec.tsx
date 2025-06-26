import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import EditPolygonButton from './EditPolygonButton';
import * as mapStore from '../../../stores/useMapStore';
import type { Variation } from '../add-asset/AddAsset';

vi.mock('maplibre-gl', () => ({
    default: {
        Popup: vi.fn().mockImplementation(() => ({
            setLngLat: vi.fn().mockReturnThis(),
            setDOMContent: vi.fn().mockReturnThis(),
            addTo: vi.fn().mockReturnThis(),
            remove: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
        })),
    },
}));

vi.mock('react-dom/client', () => ({
    createRoot: vi.fn().mockReturnValue({
        render: vi.fn(),
        unmount: vi.fn(),
    }),
}));

vi.mock('../../../shared/control-icon/ControlIcon', () => ({
    __esModule: true,
    default: function MockControlIcon({ onClick, children, 'aria-label': ariaLabel }: any) {
        return (
            <div data-testid="control-icon" onClick={onClick} aria-label={ariaLabel}>
                {children}
            </div>
        );
    },
}));

vi.mock('../../../utils/MapVisualHelper', () => ({
    MapVisualHelper: {
        getFirstPolygon: vi.fn(),
        getFeatureCollection: vi.fn(),
        getConfirmationPopupCoordinates: vi.fn(),
        removeDimmedMask: vi.fn(),
        removeExistingPopup: vi.fn(),
        removeHeatmapLayer: vi.fn(),
    },
}));

describe('EditPolygonButton', () => {
    let mockMapRef: React.RefObject<MapRef>;
    let mockDrawRef: React.RefObject<MapboxDraw | null>;
    let mockPopupRef: React.RefObject<any>;
    let mapMock: any;
    let drawMock: any;
    let mockOnPolygonEdited: any;
    let mockHideLayerControl: any;

    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) =>
            selector({
                setCachedHeatmap: vi.fn(),
                mapRef: null,
                setMapRef: function (_ref: MapRef): void {
                    throw new Error('Function not implemented.');
                },
                drawRef: null,
                setDrawRef: function (_ref: MapboxDraw): void {
                    throw new Error('Function not implemented.');
                },
                placing: false,
                setPlacing: function (_placing: boolean): void {
                    throw new Error('Function not implemented.');
                },
                markerPosition: null,
                setMarkerPosition: function (_position: { longitude?: number; latitude?: number } | null): void {
                    throw new Error('Function not implemented.');
                },
                markerBearing: null,
                setMarkerBearing: function (_bearing: number): void {
                    throw new Error('Function not implemented.');
                },
                markerVariant: null,
                setMarkerVariant: function (_variant: Variation | null): void {
                    throw new Error('Function not implemented.');
                },
                preventPolygonEdit: function (_e: MouseEvent): void {
                    throw new Error('Function not implemented.');
                },
                handleMapClick: function (_e: MapLayerMouseEvent): void {
                    throw new Error('Function not implemented.');
                },
                cachedHeatmap: null,
            })
        );

        (MapVisualHelper.getFirstPolygon as any).mockReturnValue({
            type: 'Polygon',
            coordinates: [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                ],
            ],
        });

        (MapVisualHelper.getFeatureCollection as any).mockReturnValue({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    id: 'test-polygon-id',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [0, 0],
                                [1, 0],
                                [1, 1],
                                [0, 1],
                                [0, 0],
                            ],
                        ],
                    },
                },
            ],
        });

        (MapVisualHelper.getConfirmationPopupCoordinates as any).mockReturnValue([0.5, 0.5]);

        mapMock = {
            getCanvas: () => ({ style: { cursor: '' } }),
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
            getStyle: () => ({ layers: [] }),
            addLayer: vi.fn(),
            removeLayer: vi.fn(),
            setPaintProperty: vi.fn(),
            setLayoutProperty: vi.fn(),
            getLayer: vi.fn(),
            queryRenderedFeatures: vi.fn(() => []),
            getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
            getZoom: vi.fn(() => 10),
            getBounds: vi.fn(() => ({
                getWest: () => -180,
                getEast: () => 180,
                getNorth: () => 90,
                getSouth: () => -90,
            })),
        };

        drawMock = {
            changeMode: vi.fn(),
        };

        mockMapRef = {
            current: {
                getMap: () => mapMock,
            },
        } as any;

        mockDrawRef = {
            current: drawMock,
        } as any;

        mockPopupRef = {
            current: null,
        } as any;

        mockOnPolygonEdited = vi.fn();
        mockHideLayerControl = vi.fn();
    });

    it('renders edit polygon button when visible', () => {
        render(
            <EditPolygonButton
                mapRef={mockMapRef}
                drawRef={mockDrawRef}
                onPolygonEdited={mockOnPolygonEdited}
                hideLayerControl={mockHideLayerControl}
                polygonConfirmationPopUpRef={mockPopupRef}
                isVisible={true}
            />
        );

        const button = screen.getByTestId('control-icon');
        expect(button).toBeInTheDocument();
        expect(button.getAttribute('aria-label')).toBe('Edit polygon');
    });

    it('does not render when not visible', () => {
        render(
            <EditPolygonButton
                mapRef={mockMapRef}
                drawRef={mockDrawRef}
                onPolygonEdited={mockOnPolygonEdited}
                hideLayerControl={mockHideLayerControl}
                polygonConfirmationPopUpRef={mockPopupRef}
                isVisible={false}
            />
        );

        expect(screen.queryByTestId('control-icon')).not.toBeInTheDocument();
    });

    it('handles click and sets up editing mode', () => {
        render(
            <EditPolygonButton
                mapRef={mockMapRef}
                drawRef={mockDrawRef}
                onPolygonEdited={mockOnPolygonEdited}
                hideLayerControl={mockHideLayerControl}
                polygonConfirmationPopUpRef={mockPopupRef}
                isVisible={true}
            />
        );

        const button = screen.getByTestId('control-icon');
        fireEvent.click(button);

        expect(mockHideLayerControl).toHaveBeenCalledTimes(1);
        expect(MapVisualHelper.removeDimmedMask).toHaveBeenCalledWith(mapMock);
        expect(MapVisualHelper.removeExistingPopup).toHaveBeenCalledWith(mockPopupRef);
        expect(MapVisualHelper.removeHeatmapLayer).toHaveBeenCalledWith(mockMapRef);
        expect(drawMock.changeMode).toHaveBeenCalledWith('direct_select', { featureId: 'test-polygon-id' });
    });

    it('does not proceed if no polygon is found', () => {
        (MapVisualHelper.getFirstPolygon as any).mockReturnValue(null);

        render(
            <EditPolygonButton
                mapRef={mockMapRef}
                drawRef={mockDrawRef}
                onPolygonEdited={mockOnPolygonEdited}
                hideLayerControl={mockHideLayerControl}
                polygonConfirmationPopUpRef={mockPopupRef}
                isVisible={true}
            />
        );

        const button = screen.getByTestId('control-icon');
        fireEvent.click(button);

        expect(mockHideLayerControl).toHaveBeenCalledTimes(1);
        expect(MapVisualHelper.removeDimmedMask).toHaveBeenCalledWith(mapMock);
        expect(MapVisualHelper.removeExistingPopup).toHaveBeenCalledWith(mockPopupRef);
        expect(MapVisualHelper.removeHeatmapLayer).toHaveBeenCalledWith(mockMapRef);
        expect(drawMock.changeMode).not.toHaveBeenCalled();
    });

    it('does not proceed if no feature ID is found', () => {
        (MapVisualHelper.getFeatureCollection as any).mockReturnValue({
            type: 'FeatureCollection',
            features: [],
        });

        render(
            <EditPolygonButton
                mapRef={mockMapRef}
                drawRef={mockDrawRef}
                onPolygonEdited={mockOnPolygonEdited}
                hideLayerControl={mockHideLayerControl}
                polygonConfirmationPopUpRef={mockPopupRef}
                isVisible={true}
            />
        );

        const button = screen.getByTestId('control-icon');
        fireEvent.click(button);

        expect(mockHideLayerControl).toHaveBeenCalledTimes(1);
        expect(MapVisualHelper.removeDimmedMask).toHaveBeenCalledWith(mapMock);
        expect(MapVisualHelper.removeExistingPopup).toHaveBeenCalledWith(mockPopupRef);
        expect(MapVisualHelper.removeHeatmapLayer).toHaveBeenCalledWith(mockMapRef);
        expect(drawMock.changeMode).not.toHaveBeenCalled();
    });

    it('does not proceed if map or draw is not available', () => {
        const invalidMapRef = { current: null } as any;
        const invalidDrawRef = { current: null } as any;

        render(
            <EditPolygonButton
                mapRef={invalidMapRef}
                drawRef={invalidDrawRef}
                onPolygonEdited={mockOnPolygonEdited}
                hideLayerControl={mockHideLayerControl}
                polygonConfirmationPopUpRef={mockPopupRef}
                isVisible={true}
            />
        );

        const button = screen.getByTestId('control-icon');
        fireEvent.click(button);

        expect(mockHideLayerControl).not.toHaveBeenCalled();
        expect(drawMock.changeMode).not.toHaveBeenCalled();
    });
});
