import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import MapLegendPanel from './MapLegendPanel';

const createMockMap = () => {
    const listeners: Record<string, Function[]> = {};

    const map = {
        getLayer: vi.fn((id) => id === 'heatmap-layer'),
        on: vi.fn((event, callback) => {
            listeners[event] = listeners[event] || [];
            listeners[event].push(callback);
        }),
        off: vi.fn((event, callback) => {
            listeners[event] = (listeners[event] || []).filter((fn) => fn !== callback);
        }),
        fire: (event: string) => {
            (listeners[event] || []).forEach((fn) => fn());
        },
    };

    return { map, listeners };
};

describe('MapLegendPanel', () => {
    let map: any;
    let mapRef: any;

    beforeEach(() => {
        const mock = createMockMap();
        map = mock.map;
        mapRef = { current: { getMap: () => map } };
    });

    it('does not render button if heatmap layer is not present', async () => {
        map.getLayer = vi.fn(() => false);

        await act(() => {
            render(<MapLegendPanel mapRef={mapRef} />);
        });

        expect(screen.queryByLabelText('Show map legend')).not.toBeInTheDocument();
    });

    it('renders button if heatmap layer is present after styledata', async () => {
        render(<MapLegendPanel mapRef={mapRef} />);

        await act(() => {
            map.fire('styledata');
        });

        expect(screen.getByLabelText('Show map legend')).toBeInTheDocument();
    });

    it('shows panel when button is clicked', async () => {
        render(<MapLegendPanel mapRef={mapRef} />);

        await act(() => {
            map.fire('styledata');
        });

        fireEvent.click(screen.getByLabelText('Show map legend'));

        expect(screen.getByText('Legend')).toBeInTheDocument();
        expect(screen.getByText('Location Suitability')).toBeInTheDocument();
    });

    it('hides panel when button is clicked again', async () => {
        render(<MapLegendPanel mapRef={mapRef} />);

        await act(() => {
            map.fire('styledata');
        });

        const button = screen.getByLabelText('Show map legend');

        fireEvent.click(button);
        expect(screen.getByText('Legend')).toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.queryByText('Legend')).not.toBeInTheDocument();
    });

    it('displays all legend items with correct colours', async () => {
        render(<MapLegendPanel mapRef={mapRef} />);

        await act(() => {
            map.fire('styledata');
        });

        fireEvent.click(screen.getByLabelText('Show map legend'));

        expect(screen.getByText('Most Suitable')).toBeInTheDocument();
        expect(screen.getByText('Moderate Suitability')).toBeInTheDocument();
        expect(screen.getByText('Least Suitable')).toBeInTheDocument();

        const colorLines = screen.getAllByTestId('color-line');
        expect(colorLines).toHaveLength(3);
        expect(colorLines[0]).toHaveStyle({ backgroundColor: '#4CAF50' });
        expect(colorLines[1]).toHaveStyle({ backgroundColor: '#FF9800' });
        expect(colorLines[2]).toHaveStyle({ backgroundColor: '#F44336' });
    });
});
