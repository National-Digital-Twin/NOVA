import { fireEvent, render, screen } from '@testing-library/react';
import type { ViewState } from 'react-map-gl/maplibre';
import { describe, expect, it, vi } from 'vitest';
import MapComponent from '../../components/map/MapComponent';

vi.mock('react-map-gl/maplibre', () => ({
    Map: ({ children, onMove, onLoad }: { children: React.ReactNode; onMove?: (evt: { viewState: ViewState }) => void; onLoad?: () => void }) => (
        <div
            data-testid="map"
            onClick={() => {
                onMove?.({
                    viewState: { longitude: -1.33, latitude: 50.65, zoom: 10, pitch: 60, bearing: 0, padding: { top: 0, bottom: 0, left: 0, right: 0 } },
                });
                onLoad?.();
            }}
        >
            {children}
        </div>
    ),
    Source: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Layer: () => null,
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
});
