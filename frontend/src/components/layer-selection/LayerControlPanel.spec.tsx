import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MapRef } from 'react-map-gl/maplibre';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import LayerControlPanel from './LayerControlPanel';

const mockMapRef = { current: {} } as unknown as React.RefObject<MapRef>;
const mockDrawRef = { current: {} } as unknown as React.RefObject<MapboxDraw>;

const mockApiResponse = {
    categories: [
        {
            name: 'Environmental protected sites',
            items: [
                {
                    id: 'aonb',
                    name: 'Areas of outstanding natural beauty',
                    attributes: [
                        {
                            id: 'distance',
                            description: 'Distance from layer',
                            defaultValue: 2,
                            valueType: 'number',
                        },
                    ],
                },
            ],
        },
        {
            name: 'Weather',
            items: [
                {
                    id: 'windSpeed',
                    name: 'Wind speed',
                    attributes: [],
                },
            ],
        },
        {
            name: 'Residential',
            items: [
                {
                    id: 'residentialBuiltUp',
                    name: 'Built up areas',
                    attributes: [],
                },
            ],
        },
    ],
};

const fakeGeoJSON = {
    type: 'FeatureCollection',
    features: [],
};

describe('LayerControlPanel', () => {
    let fetchSpy: MockInstance;

    beforeEach(() => {
        vi.clearAllMocks();

        fetchSpy = vi.spyOn(global, 'fetch' as any).mockImplementation((...args: unknown[]) => {
            const url = args[0] as string;
            if (url === '/api/ui/layers') {
                return Promise.resolve({
                    ok: true,
                    json: async () => mockApiResponse,
                }) as unknown as Promise<Response>;
            }
            return Promise.resolve({
                ok: true,
                json: async () => fakeGeoJSON,
            }) as unknown as Promise<Response>;
        });

        vi.spyOn(MapVisualHelper, 'addOrUpdateHeatmapLayer').mockImplementation(() => {});
    });

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    it('renders panel with header and apply button', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        expect(await screen.findByText('Layers')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });

    it('renders some layer names and their checkboxes', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        expect(await screen.findByText('Areas of outstanding natural beauty')).toBeInTheDocument();
        expect(await screen.findByText('Wind speed')).toBeInTheDocument();
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });

    it('toggles checkbox state when clicked', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        const checkbox = await screen.findByLabelText('Wind speed');
        expect((checkbox as HTMLInputElement).checked).toBe(true);
        await userEvent.click(checkbox);
        expect((checkbox as HTMLInputElement).checked).toBe(false);
    });

    it('filters layers by search input', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        const searchInput = await screen.findByPlaceholderText('Search for layers');
        await userEvent.type(searchInput, 'built up');
        expect(await screen.findByText('Built up areas')).toBeInTheDocument();
        expect(screen.queryByText('Wind speed')).not.toBeInTheDocument();
    });

    it('shows "No results" for unmatched search', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        const searchInput = await screen.findByPlaceholderText('Search for layers');
        await userEvent.type(searchInput, 'nonexistent');
        expect(await screen.findByText('No results')).toBeInTheDocument();
    });

    it('clears search when clear button is clicked', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        const searchInput = await screen.findByPlaceholderText('Search for layers');
        await userEvent.type(searchInput, 'Wind');

        const clearBtn = await screen.findByLabelText('Clear search');
        await userEvent.click(clearBtn);

        expect(searchInput).toHaveValue('');
        expect(await screen.findByText('Wind speed')).toBeInTheDocument();
    });

    it('shows no results when search is only spaces', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        const searchInput = await screen.findByPlaceholderText('Search for layers');
        await userEvent.type(searchInput, '   ');
        expect(await screen.findByText('No results')).toBeInTheDocument();
    });

    it('does not render accordion for categories with no matching layers', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        const searchInput = await screen.findByPlaceholderText('Search for layers');
        await userEvent.type(searchInput, 'wind');

        expect(screen.queryByText('Residential')).not.toBeInTheDocument();
        expect(await screen.findByText('Wind speed')).toBeInTheDocument();
    });

    it('toggles accordion expansion', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        const summary = await screen.findByText('Environmental protected sites');
        await userEvent.click(summary);
        await userEvent.click(summary);
        expect(await screen.findByText('Areas of outstanding natural beauty')).toBeInTheDocument();
    });

    it('collapses and expands the panel with toggle button', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        await screen.findByText('Layers');

        const toggleBtn = screen.getAllByRole('button').find((btn) => btn.querySelector('svg'));
        expect(toggleBtn).toBeTruthy();

        await userEvent.click(toggleBtn!);
        expect(screen.queryByText('Layers')).not.toBeInTheDocument();

        await userEvent.click(toggleBtn!);
        expect(await screen.findByText('Layers')).toBeInTheDocument();
    });

    it('rotates toggle icon when collapsed', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        await screen.findByText('Layers');

        const toggleBtn = screen.getAllByRole('button').find((btn) => btn.querySelector('svg'));
        expect(toggleBtn).toBeTruthy();

        await userEvent.click(toggleBtn!);

        const icon = toggleBtn!.querySelector('svg');
        const styles = window.getComputedStyle(icon as Element);
        expect(styles.transform).toMatch(/rotate\(180deg\)/);
    });

    it('renders all userAdjustableParameters in the drawer', async () => {
        render(<LayerControlPanel mapRef={mockMapRef} drawRef={mockDrawRef} />);
        await screen.findByText('Areas of outstanding natural beauty');

        const targetBtn = screen.getAllByRole('button').find((btn) => btn.parentElement?.textContent?.includes('Areas of outstanding natural beauty'));
        expect(targetBtn).toBeTruthy();

        await userEvent.click(targetBtn!);

        const input = await screen.findByLabelText('Distance from layer');
        expect(input).toBeInTheDocument();
        expect((input as HTMLInputElement).value).toBe('2');
    });
});
