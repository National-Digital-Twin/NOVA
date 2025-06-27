import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ViewState } from 'react-map-gl/maplibre';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MapComponent from '../../components/map/MapComponent';
import * as mapStore from '../../stores/useMapStore';
import type { MapState, PolygonStatus } from '../../stores/useMapStore';

// --- Helper to create a complete mock Zustand state ---
const createMockMapState = (overrides: Partial<MapState> = {}): MapState => ({
    mapRef: null,
    setMapRef: vi.fn(),

    drawRef: null,
    setDrawRef: vi.fn(),

    polygonConfirmPopup: null,
    setPolygonConfirmPopup: vi.fn(),

    placing: false,
    setPlacing: vi.fn(),

    markerPosition: null,
    setMarkerPosition: vi.fn(),

    markerBearing: null,
    setMarkerBearing: vi.fn(),

    markerVariant: null,
    setMarkerVariant: vi.fn(),

    cachedHeatmap: null,
    setCachedHeatmap: vi.fn(),

    polygonStatus: 'none' as PolygonStatus,
    setPolygonStatus: vi.fn(),

    clearMarkerValues: vi.fn(),

    ...overrides,
});

// --- Mocks ---

vi.mock('../../components/search/SearchPanel', () => ({
    default: () => <div data-testid="search-panel" />,
}));

vi.mock('react-map-gl/maplibre', () => ({
    Map: ({
        children,
        onMove,
        onLoad,
        onClick,
    }: {
        children: React.ReactNode;
        onMove?: (evt: { viewState: ViewState }) => void;
        onLoad?: () => void;
        onClick?: (e: any) => void;
    }) => (
        <div
            data-testid="map"
            onClick={() => {
                onMove?.({
                    viewState: {
                        longitude: -1.33,
                        latitude: 50.65,
                        zoom: 10,
                        pitch: 60,
                        bearing: 0,
                        padding: { top: 0, bottom: 0, left: 0, right: 0 },
                    },
                });
                onLoad?.();
                onClick?.({ lngLat: { lng: -1.33, lat: 50.65 } });
            }}
        >
            {children}
        </div>
    ),
    Source: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Layer: () => null,
    Marker: ({ longitude, latitude, children }: { longitude: number; latitude: number; children: React.ReactNode }) => (
        <div data-testid="mock-marker" data-lng={longitude} data-lat={latitude}>
            {children}
        </div>
    ),
}));

vi.mock('../../components/map-controls/MapControls', () => ({
    default: ({ onStyleChange }: { onStyleChange: (style: string) => void }) => (
        <div data-testid="map-controls">
            <button onClick={() => onStyleChange('basic')}>Change Style</button>
        </div>
    ),
}));

// --- Tests ---

describe('MapComponent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render controls before map is initialized', () => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) => selector(createMockMapState()));

        render(<MapComponent />);
        expect(screen.getByTestId('map')).toBeInTheDocument();
        expect(screen.queryByTestId('map-controls')).not.toBeInTheDocument();
    });

    it('renders controls after map is initialized', () => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) => selector(createMockMapState()));

        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));
        expect(screen.getByTestId('map-controls')).toBeInTheDocument();
    });

    it('handles map style changes', () => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) => selector(createMockMapState()));

        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map')); // triggers onLoad
        fireEvent.click(screen.getByText('Change Style'));
        expect(screen.getByTestId('map')).toBeInTheDocument();
    });

    it('handles map movement', () => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) => selector(createMockMapState()));

        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));
        expect(screen.getByTestId('map')).toBeInTheDocument();
    });

    it('shows the wind turbine pending icon when placing asset', async () => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) => selector(createMockMapState({ placing: true })));

        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));

        const moveEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 200,
        });
        window.dispatchEvent(moveEvent);

        await waitFor(() => {
            expect(screen.getByAltText(/Wind Turbine pending/i)).toBeInTheDocument();
        });
    });

    it('shows the wind turbine confirmed icon when placed', () => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) =>
            selector(
                createMockMapState({
                    placing: false,
                    markerPosition: { longitude: -1.33, latitude: 50.65 },
                })
            )
        );

        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));
        expect(screen.getByAltText('Wind Turbine')).toBeInTheDocument();
    });
});
