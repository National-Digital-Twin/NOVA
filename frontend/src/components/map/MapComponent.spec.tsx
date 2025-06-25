import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ViewState } from 'react-map-gl/maplibre';
import { describe, expect, it, vi } from 'vitest';
import MapComponent from '../../components/map/MapComponent';

vi.mock('../../components/search/SearchPanel', () => ({
    default: ({ setPlacing, showLayerControl }: { setPlacing: () => void, showLayerControl: () => void}) => (
        <div data-testid="search-panel">
            <button onClick={showLayerControl}>Show Layer Panel</button>
            <button onClick={setPlacing}>Add Asset</button>
        </div>
    ),
}));

vi.mock('react-map-gl/maplibre', () => ({
    Map: ({ children, onMove, onLoad, onClick }: { children: React.ReactNode; onMove?: (evt: { viewState: ViewState }) => void; onLoad?: () => void; onClick?: (e: any) => void; }) => (
        <div
            data-testid="map"
            onClick={() => {
                onMove?.({
                    viewState: { longitude: -1.33, latitude: 50.65, zoom: 10, pitch: 60, bearing: 0, padding: { top: 0, bottom: 0, left: 0, right: 0 } },
                });
                onLoad?.();
                const fakeMapEvent = { lngLat: { lng: -1.33, lat: 50.65 } };
                onClick?.(fakeMapEvent);
            }}
        >
            {children}
        </div>
    ),
    Source: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Layer: () => null,
    Marker: ({ longitude, latitude, children }: { longitude: number, latitude: number, children: React.ReactNode }) => (
        <div
            data-testid="mock-marker"
            data-lng={longitude}
            data-lat={latitude}
        >
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

describe('MapComponent', () => {
    it('does not render controls before map is initialized', () => {
        render(<MapComponent />);
        expect(screen.getByTestId('map')).toBeInTheDocument();
        expect(screen.queryByTestId('map-controls')).not.toBeInTheDocument();
    });

    it('renders controls after map is initialized', () => {
        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));
        expect(screen.getByTestId('map-controls')).toBeInTheDocument();
    });

    it('handles map style changes', () => {
        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));
        fireEvent.click(screen.getByText('Change Style'));
        expect(screen.getByTestId('map')).toBeInTheDocument();
    });

    it('handles map movement', () => {
        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));
        expect(screen.getByTestId('map')).toBeInTheDocument();
    });

    it('shows the layer control panel when triggered from SearchPanel', () => {
        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map')); // Initialise map
        fireEvent.click(screen.getByText('Show Layer Panel')); // Trigger setShowLayerControl(true)
        expect(screen.getByText('Layers')).toBeInTheDocument(); // From LayerControlPanel
    });

    it('shows the wind turbine pending icon when placing asset', async () => {
        await act(async () => render(<MapComponent />));
        fireEvent.click(screen.getByTestId('map'));
        fireEvent.click(screen.getByText('Add Asset')); // Trigger setPlacing(true)
        
        const event = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 200,
        });
        window.dispatchEvent(event);

        await waitFor(() => {
            expect(screen.getByAltText(/Wind Turbine pending/i)).toBeInTheDocument();
        });
    });

    it('shows the wind turbine confirmed icon when placing asset', () => {
        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));
        fireEvent.click(screen.getByText('Add Asset')); // Trigger setPlacing(true)
        fireEvent.click(screen.getByTestId('map'));

        expect(screen.queryByAltText('Wind Turbine')).toBeInTheDocument();
    });
});
