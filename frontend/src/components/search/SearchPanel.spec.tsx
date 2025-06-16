import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FeatureCollection, Geometry } from 'geojson';
import type { MapRef } from 'react-map-gl/maplibre';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchPanel from './SearchPanel';

vi.mock('./search-input/SearchInput', () => ({
    default: ({ onSearch }: { onSearch: (query: string) => void }) => (
        <input
            type="text"
            data-testid="search-input"
            onKeyDown={e => e.key === 'Enter' && onSearch(e.currentTarget.value)}
            aria-label="Search by region or country"
        />
    ),
}));

vi.mock('./draw-polygon/DrawPolygonButton', () => ({
    default: ({ onPolygonDrawn }: { onPolygonDrawn: (feature: FeatureCollection<Geometry>) => void }) => (
        <button
            data-testid="draw-polygon-button"
            onClick={() => {
                if (onPolygonDrawn) {
                    onPolygonDrawn({
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                geometry: {
                                    type: 'Polygon',
                                    coordinates: [
                                        [
                                            [0, 0],
                                            [0, 1],
                                            [1, 1],
                                            [1, 0],
                                            [0, 0],
                                        ],
                                    ],
                                },
                                properties: {},
                            },
                        ],
                    });
                }
            }}
        >
            Draw Polygon
        </button>
    ),
}));

vi.mock('./delete-polygon/DeletePolygonButton', () => ({
    default: ({ onDelete }: { onDelete: () => void }) => (
        <button data-testid="delete-polygon-button" onClick={onDelete}>
            Delete Polygon
        </button>
    ),
}));

vi.mock('./polygon-layer/PolygonLayer', () => ({
    default: ({ data }: { data: FeatureCollection<Geometry> }) => <div data-testid="polygon-layer" data-features={JSON.stringify(data.features)} />,
}));

describe('SearchPanel', () => {
    const mockAddControl = vi.fn().mockImplementation(() => ({
        on: vi.fn(),
        off: vi.fn(),
    }));

    const mockMapRef = {
        current: {
            getMap: vi.fn().mockReturnValue({
                flyTo: vi.fn(),
                addControl: mockAddControl,
                removeControl: vi.fn(),
                on: vi.fn(),
                off: vi.fn(),
            }),
        },
    } as unknown as React.RefObject<MapRef>;

    beforeEach(() => {
        vi.clearAllMocks();
        window.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve({
                        coordinates: [-2.0943, 57.1497],
                        zoom: 12,
                    }),
            })
        );
    });

    it('renders search input and drawing controls', () => {
        render(<SearchPanel mapRef={mockMapRef} />);
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByTestId('draw-polygon-button')).toBeInTheDocument();
        expect(screen.getByTestId('delete-polygon-button')).toBeInTheDocument();
    });

    it('handles search and flies to location', async () => {
        const user = userEvent.setup({ delay: null });
        render(<SearchPanel mapRef={mockMapRef} />);
        const input = screen.getByTestId('search-input') as HTMLInputElement;

        await user.type(input, 'Aberdeen{enter}');

        await waitFor(
            () => {
                expect(window.fetch).toHaveBeenCalledWith('/data/mock-search-response.json');
                expect(mockMapRef.current?.getMap().flyTo).toHaveBeenCalledWith({
                    center: [-2.0943, 57.1497],
                    zoom: 12,
                    duration: 2000,
                });
            },
            { timeout: 2000 }
        );
    });

    it('handles search error gracefully', async () => {
        const user = userEvent.setup({ delay: null });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        window.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(<SearchPanel mapRef={mockMapRef} />);
        const input = screen.getByTestId('search-input') as HTMLInputElement;

        await user.type(input, 'Aberdeen{enter}');

        await waitFor(
            () => {
                expect(consoleSpy).toHaveBeenCalledWith('Error searching location:', expect.any(Error));
            },
            { timeout: 2000 }
        );

        consoleSpy.mockRestore();
    });

    it('does not search with empty input', async () => {
        const user = userEvent.setup({ delay: null });
        render(<SearchPanel mapRef={mockMapRef} />);
        const input = screen.getByTestId('search-input') as HTMLInputElement;

        await user.type(input, '   {enter}');

        await waitFor(
            () => {
                expect(window.fetch).not.toHaveBeenCalled();
                expect(mockMapRef.current?.getMap().flyTo).not.toHaveBeenCalled();
            },
            { timeout: 2000 }
        );
    });

    it('loads and displays polygon data after drawing', async () => {
        const mockResponse: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [0, 0],
                                [0, 1],
                                [1, 1],
                                [1, 0],
                                [0, 0],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        };

        window.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                json: () => Promise.resolve(mockResponse),
            })
        );

        render(<SearchPanel mapRef={mockMapRef} />);
        const drawButton = screen.getByTestId('draw-polygon-button');

        await userEvent.click(drawButton);
        const drawControl = mockAddControl.mock.results[0].value;
        drawControl.on('draw.create', { features: mockResponse.features });

        await waitFor(
            () => {
                expect(window.fetch).toHaveBeenCalledWith('/data/sample-polygons.json', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(mockResponse),
                });
                const polygonLayer = screen.getByTestId('polygon-layer');
                expect(polygonLayer).toHaveAttribute('data-features', JSON.stringify(mockResponse.features));
            },
            { timeout: 2000 }
        );
    });

    it('handles fetch errors gracefully', async () => {
        const error = new Error('Network error');
        (window.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<SearchPanel mapRef={mockMapRef} />);
        const drawButton = screen.getByTestId('draw-polygon-button');

        await userEvent.click(drawButton);
        const drawControl = mockAddControl.mock.results[0].value;
        drawControl.on('draw.create', { features: [] });

        await waitFor(
            () => {
                expect(consoleSpy).toHaveBeenCalledWith('Error processing polygon data:', error);
            },
            { timeout: 2000 }
        );

        consoleSpy.mockRestore();
    });
});
