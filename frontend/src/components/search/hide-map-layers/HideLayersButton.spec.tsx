import { fireEvent, render, screen } from '@testing-library/react';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre';
import { vi, describe, it, beforeEach } from 'vitest';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import HideLayersButton from './HideLayersButton';
import * as mapStore from '../../../stores/useMapStore';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { FeatureCollection } from 'geojson';
import type { Variation } from '../add-asset/AddAsset';

describe('HideLayersButton', () => {
    const getMockMap = () => {
        return {
            getLayer: vi.fn(),
            getStyle: vi.fn(() => ({
                layers: [{ id: 'background' }, { id: 'basemap-road' }, { id: 'heatmap-layer' }, { id: 'custom-layer-1' }],
            })),
            setLayoutProperty: vi.fn(),
        };
    };

    const mockMapRef = (): React.RefObject<MapRef> =>
        ({
            current: {
                getMap: () => getMockMap(),
            },
        }) as unknown as React.RefObject<MapRef>;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('does not render button if cachedHeatmap is null', () => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation(() => null); // simulate no heatmap
        render(<HideLayersButton mapRef={mockMapRef()} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders button if cachedHeatmap is set', () => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) =>
            selector({
                cachedHeatmap: { type: 'FeatureCollection', features: [] },
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
                setCachedHeatmap: function (_featureCollection: FeatureCollection | null): void {
                    throw new Error('Function not implemented.');
                },
            })
        );
        render(<HideLayersButton mapRef={mockMapRef()} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('toggles layers visibility on click', async () => {
        const hideMock = vi.spyOn(MapVisualHelper, 'hideNonBaseLayers').mockReturnValue(['custom-layer-1']);
        const showMock = vi.spyOn(MapVisualHelper, 'showLayers').mockImplementation(() => {});
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) =>
            selector({
                cachedHeatmap: { type: 'FeatureCollection', features: [] },
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
                setCachedHeatmap: function (_featureCollection: FeatureCollection | null): void {
                    throw new Error('Function not implemented.');
                },
            })
        );

        render(<HideLayersButton mapRef={mockMapRef()} />);
        const button = await screen.findByRole('button');

        fireEvent.click(button); // hide
        expect(hideMock).toHaveBeenCalled();

        fireEvent.click(button); // show
        expect(showMock).toHaveBeenCalledWith(expect.anything(), ['custom-layer-1']);
    });
});
