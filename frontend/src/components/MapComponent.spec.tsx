import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MapComponent from './MapComponent';

interface MapProps {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
    children?: React.ReactNode;
}

vi.mock('react-map-gl/maplibre', () => ({
    Map: ({ longitude, latitude, zoom, pitch, bearing, children }: MapProps) => (
        <div data-testid="map-container" data-longitude={longitude} data-latitude={latitude} data-zoom={zoom} data-pitch={pitch} data-bearing={bearing}>
            {children}
        </div>
    ),
    NavigationControl: () => <div data-testid="navigation-control" />,
    Source: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Layer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./DrawerComponent', () => ({
    default: ({ layerVisibility, onToggleLayer }: { layerVisibility: { heatmap: boolean; polygons: boolean }; onToggleLayer: (layer: string) => void }) => (
        <div data-testid="drawer-component" data-heatmap-visible={layerVisibility.heatmap} data-polygons-visible={layerVisibility.polygons}>
            <button onClick={() => onToggleLayer('heatmap')}>Toggle Heatmap</button>
            <button onClick={() => onToggleLayer('polygons')}>Toggle Polygons</button>
        </div>
    ),
}));

vi.mock('./RandomHeatmapLayer', () => ({
    default: () => <div data-testid="heatmap-layer" />,
}));

vi.mock('./RandomPolygonsLayer', () => ({
    default: () => <div data-testid="polygons-layer" />,
}));

vi.mock('@/env', () => ({
    VITE_MAPTILER_API_KEY: 'test-token',
}));

describe('MapComponent', () => {
    it('renders the map container', () => {
        render(<MapComponent />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders the navigation control', () => {
        render(<MapComponent />);
        expect(screen.getByTestId('navigation-control')).toBeInTheDocument();
    });

    it('initializes with correct view state', () => {
        render(<MapComponent />);
        const map = screen.getByTestId('map-container');
        expect(map).toHaveAttribute('data-longitude', '-1.33');
        expect(map).toHaveAttribute('data-latitude', '50.65');
        expect(map).toHaveAttribute('data-zoom', '10');
        expect(map).toHaveAttribute('data-pitch', '60');
        expect(map).toHaveAttribute('data-bearing', '0');
    });

    it('renders both layers by default', () => {
        render(<MapComponent />);
        expect(screen.getByTestId('heatmap-layer')).toBeInTheDocument();
        expect(screen.getByTestId('polygons-layer')).toBeInTheDocument();
    });

    it('passes correct initial layer visibility to drawer', () => {
        render(<MapComponent />);
        const drawer = screen.getByTestId('drawer-component');
        expect(drawer).toHaveAttribute('data-heatmap-visible', 'true');
        expect(drawer).toHaveAttribute('data-polygons-visible', 'true');
    });

    it('toggles layer visibility when drawer controls are clicked', async () => {
        render(<MapComponent />);

        expect(screen.getByTestId('heatmap-layer')).toBeInTheDocument();
        expect(screen.getByTestId('polygons-layer')).toBeInTheDocument();

        await act(async () => {
            screen.getByText('Toggle Heatmap').click();
        });
        expect(screen.queryByTestId('heatmap-layer')).not.toBeInTheDocument();
        expect(screen.getByTestId('polygons-layer')).toBeInTheDocument();

        await act(async () => {
            screen.getByText('Toggle Polygons').click();
        });
        expect(screen.queryByTestId('heatmap-layer')).not.toBeInTheDocument();
        expect(screen.queryByTestId('polygons-layer')).not.toBeInTheDocument();

        await act(async () => {
            screen.getByText('Toggle Heatmap').click();
            screen.getByText('Toggle Polygons').click();
        });
        expect(screen.getByTestId('heatmap-layer')).toBeInTheDocument();
        expect(screen.getByTestId('polygons-layer')).toBeInTheDocument();
    });
});
