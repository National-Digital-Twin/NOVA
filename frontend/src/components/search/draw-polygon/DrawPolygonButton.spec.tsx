import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { MapRef } from 'react-map-gl/maplibre';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DrawPolygonButton from './DrawPolygonButton';

interface ControlButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
    'aria-label': string;
    'aria-pressed': boolean;
}

vi.mock('../../../shared/control-button/ControlButton', () => ({
    default: ({ children, onClick, isActive, 'aria-label': ariaLabel, 'aria-pressed': ariaPressed }: ControlButtonProps) => (
        <button
            onClick={onClick}
            className={isActive ? 'Mui-selected' : ''}
            aria-label={ariaLabel}
            aria-pressed={ariaPressed}
            data-testid="control-button"
            data-active={isActive}
        >
            {children}
        </button>
    ),
}));

describe('DrawPolygonButton', () => {
    const mockMapRef = {
        current: {
            on: vi.fn(),
            off: vi.fn(),
            addControl: vi.fn(),
            removeControl: vi.fn(),
            getMap: vi.fn().mockReturnValue({
                on: vi.fn(),
                off: vi.fn(),
            }),
        },
    } as unknown as React.RefObject<MapRef>;

    const mockDrawRef = {
        current: {
            on: vi.fn(),
            off: vi.fn(),
            getAll: vi.fn().mockReturnValue({
                type: 'FeatureCollection',
                features: [],
            }),
            changeMode: vi.fn(),
            deleteAll: vi.fn(),
            getMode: vi.fn().mockReturnValue('simple_select'),
        },
    } as unknown as React.RefObject<MapboxDraw>;

    const mockOnPolygonDrawn = vi.fn();
    let modeChangeCallback: ((event: { mode: string }) => void) | null = null;

    beforeEach(() => {
        vi.clearAllMocks();
        modeChangeCallback = null;
        (mockDrawRef.current?.getMode as ReturnType<typeof vi.fn>).mockReturnValue('simple_select');
        (mockDrawRef.current?.getAll as ReturnType<typeof vi.fn>).mockReturnValue({
            type: 'FeatureCollection',
            features: [],
        });
        (mockMapRef.current?.getMap().on as ReturnType<typeof vi.fn>).mockImplementation((event, callback) => {
            if (event === 'draw.modechange') {
                modeChangeCallback = callback;
            }
        });
    });

    it('renders the button with correct aria label', () => {
        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);

        const button = screen.getByRole('button', { name: 'Draw Polygon' });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('toggles between draw_polygon and simple_select modes', async () => {
        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);

        const button = screen.getByRole('button', { name: 'Draw Polygon' });

        await act(async () => {
            fireEvent.click(button);
        });

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-pressed', 'true');
            expect(button).toHaveClass('Mui-selected');
        });

        expect(mockDrawRef.current?.changeMode).toHaveBeenCalledWith('draw_polygon');
        expect(mockMapRef.current?.getMap().on).toHaveBeenCalledWith('draw.modechange', expect.any(Function));

        await act(async () => {
            if (modeChangeCallback) {
                modeChangeCallback({ mode: 'simple_select' });
            }
        });

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-pressed', 'false');
            expect(button).not.toHaveClass('Mui-selected');
        });

        await act(async () => {
            fireEvent.click(button);
        });

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-pressed', 'true');
            expect(button).toHaveClass('Mui-selected');
        });

        expect(mockDrawRef.current?.changeMode).toHaveBeenCalledWith('draw_polygon');
    });

    it('shows active state when in draw_polygon mode', async () => {
        (mockDrawRef.current?.getMode as ReturnType<typeof vi.fn>).mockReturnValue('draw_polygon');

        await act(async () => {
            render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);
        });

        const button = screen.getByRole('button', { name: 'Draw Polygon' });
        await waitFor(() => {
            expect(button).toHaveAttribute('aria-pressed', 'false');
            expect(button).not.toHaveClass('Mui-selected');
        });
    });

    it('shows inactive state when in simple_select mode', async () => {
        (mockDrawRef.current?.getMode as ReturnType<typeof vi.fn>).mockReturnValue('simple_select');

        await act(async () => {
            render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);
        });

        const button = screen.getByRole('button', { name: 'Draw Polygon' });
        await waitFor(() => {
            expect(button).toHaveAttribute('aria-pressed', 'false');
            expect(button).not.toHaveClass('Mui-selected');
        });
    });

    it('handles null drawRef.current gracefully', () => {
        const nullDrawRef = { current: null } as unknown as React.RefObject<MapboxDraw>;
        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={nullDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);

        const button = screen.getByRole('button', { name: 'Draw Polygon' });
        fireEvent.click(button);
        expect(mockOnPolygonDrawn).not.toHaveBeenCalled();
    });

    it('does nothing if mapRef.current is null on click', () => {
        const nullMapRef = { current: null } as unknown as React.RefObject<MapRef>;
        render(<DrawPolygonButton mapRef={nullMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);

        const button = screen.getByRole('button', { name: 'Draw Polygon' });
        fireEvent.click(button);
        expect(mockDrawRef.current?.changeMode).not.toHaveBeenCalled();
    });

    it('does nothing if drawRef.current is null on click', () => {
        const nullDrawRef = { current: null } as unknown as React.RefObject<MapboxDraw>;
        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={nullDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);

        const button = screen.getByRole('button', { name: 'Draw Polygon' });
        fireEvent.click(button);
        expect(mockDrawRef.current?.changeMode).not.toHaveBeenCalled();
    });

    it('handleModeChange does nothing if mapRef.current is null', () => {
        const nullMapRef = { current: null } as unknown as React.RefObject<MapRef>;
        render(<DrawPolygonButton mapRef={nullMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);

        const button = screen.getByRole('button', { name: 'Draw Polygon' });
        fireEvent.click(button);
        expect(mockDrawRef.current?.changeMode).not.toHaveBeenCalled();
    });

    it('calls onPolygonDrawn when isActive becomes false and there are features', async () => {
        const mockFeatures: FeatureCollection<Geometry, GeoJsonProperties> = {
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
        (mockDrawRef.current?.getAll as ReturnType<typeof vi.fn>).mockReturnValue(mockFeatures);

        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} />);

        const button = screen.getByRole('button', { name: 'Draw Polygon' });

        await act(async () => {
            fireEvent.click(button);
        });

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-pressed', 'true');
            expect(button).toHaveClass('Mui-selected');
        });

        await act(async () => {
            if (modeChangeCallback) {
                modeChangeCallback({ mode: 'simple_select' });
            }
        });

        await waitFor(() => {
            expect(button).toHaveAttribute('aria-pressed', 'false');
            expect(button).not.toHaveClass('Mui-selected');
            expect(mockOnPolygonDrawn).toHaveBeenCalledWith(mockFeatures);
        });
    });
});
