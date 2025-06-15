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

vi.mock('../../components/map-layers/polygons/RandomPolygonsLayer', () => ({
    default: () => <div data-testid="polygons-layer">Polygons Layer</div>,
}));

vi.mock('../../components/map-layers/heatmap/RandomHeatmapLayer', () => ({
    default: () => <div data-testid="heatmap-layer">Heatmap Layer</div>,
}));

vi.mock('../../components/sidebar/SidebarComponent', () => ({
    default: ({ onToggleLayer }: { onToggleLayer: (layer: string) => void }) => (
        <div>
            <button onClick={() => onToggleLayer('polygons')}>Toggle Polygons</button>
            <button onClick={() => onToggleLayer('heatmap')}>Toggle Heatmap</button>
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
        expect(screen.getByTestId('polygons-layer')).toBeInTheDocument();
        expect(screen.getByTestId('heatmap-layer')).toBeInTheDocument();
    });

    it('handles layer toggling', () => {
        render(<MapComponent />);
        fireEvent.click(screen.getByTestId('map'));

        expect(screen.getByTestId('polygons-layer')).toBeInTheDocument();
        expect(screen.getByTestId('heatmap-layer')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Toggle Polygons'));
        expect(screen.queryByTestId('polygons-layer')).not.toBeInTheDocument();
        expect(screen.getByTestId('heatmap-layer')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Toggle Heatmap'));
        expect(screen.queryByTestId('polygons-layer')).not.toBeInTheDocument();
        expect(screen.queryByTestId('heatmap-layer')).not.toBeInTheDocument();
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
