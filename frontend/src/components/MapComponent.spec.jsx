import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/test-utils';
import MapComponent from './MapComponent';

vi.mock('mapbox-gl', () => ({
    Map: vi.fn(() => ({
        on: vi.fn(),
        addControl: vi.fn(),
        addSource: vi.fn(),
        addLayer: vi.fn(),
        removeLayer: vi.fn(),
        removeSource: vi.fn(),
        getMap: vi.fn(() => ({
            on: vi.fn(),
            addSource: vi.fn(),
            setTerrain: vi.fn(),
            addLayer: vi.fn(),
        })),
    })),
    NavigationControl: vi.fn(),
}));

vi.mock('react-map-gl/mapbox', () => ({
    default: ({ children, onMove }) => (
        <div data-testid="map" onClick={() => onMove && onMove({ viewState: { longitude: -1.3033, latitude: 50.6942, zoom: 10 } })}>
            {children}
        </div>
    ),
    NavigationControl: () => <div data-testid="navigation-control" />,
    Source: ({ children }) => <div data-testid="map-source">{children}</div>,
    Layer: ({ children }) => <div data-testid="map-layer">{children}</div>,
}));

vi.mock('./ProtectedAreas', () => ({
    default: ({ visible }) => (visible ? <div data-testid="protected-areas" /> : null),
}));

vi.mock('./WindTurbines', () => ({
    default: ({ visible }) => (visible ? <div data-testid="wind-turbines" /> : null),
}));

vi.mock('./SidePanel', () => ({
    default: ({ onLayerToggle, onDrawerToggle, isOpen }) => (
        <div data-testid="side-panel">
            <button onClick={() => onLayerToggle('protectedAreas')} data-testid="toggle-protected">
                Toggle Protected Areas
            </button>
            <button onClick={() => onLayerToggle('windTurbines')} data-testid="toggle-wind">
                Toggle Wind Turbines
            </button>
            <button onClick={onDrawerToggle} data-testid="toggle-drawer">
                Toggle Drawer
            </button>
            <div data-testid="drawer-state">{isOpen ? 'open' : 'closed'}</div>
        </div>
    ),
}));

describe('MapComponent', () => {
    it('renders the map container', () => {
        renderWithTheme(<MapComponent />);
        const mapContainer = screen.getByTestId('map-container');
        expect(mapContainer).toBeInTheDocument();
    });

    it('renders the map component', () => {
        renderWithTheme(<MapComponent />);
        const map = screen.getByTestId('map');
        expect(map).toBeInTheDocument();
    });

    it('renders the navigation control', () => {
        renderWithTheme(<MapComponent />);
        const navControl = screen.getByTestId('navigation-control');
        expect(navControl).toBeInTheDocument();
    });

    it('handles layer visibility toggles', () => {
        renderWithTheme(<MapComponent />);

        expect(screen.getByTestId('protected-areas')).toBeInTheDocument();
        expect(screen.getByTestId('wind-turbines')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('toggle-protected'));
        expect(screen.queryByTestId('protected-areas')).not.toBeInTheDocument();
        expect(screen.getByTestId('wind-turbines')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('toggle-wind'));
        expect(screen.queryByTestId('protected-areas')).not.toBeInTheDocument();
        expect(screen.queryByTestId('wind-turbines')).not.toBeInTheDocument();
    });

    it('handles drawer toggle', () => {
        renderWithTheme(<MapComponent />);

        expect(screen.getByTestId('drawer-state')).toHaveTextContent('open');

        fireEvent.click(screen.getByTestId('toggle-drawer'));
        expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed');
    });

    it('handles map movement', () => {
        renderWithTheme(<MapComponent />);

        fireEvent.click(screen.getByTestId('map'));

        const map = screen.getByTestId('map');
        expect(map).toBeInTheDocument();
    });
});
