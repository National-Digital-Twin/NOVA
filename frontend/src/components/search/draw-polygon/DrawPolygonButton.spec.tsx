import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import type { MapRef } from 'react-map-gl/maplibre';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DrawPolygonButton from './DrawPolygonButton';

vi.mock('../../../shared/control-icon/ControlIcon', () => ({
    default: ({ children, onClick, isActive, 'aria-label': ariaLabel, 'aria-pressed': ariaPressed }: any) => (
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
    const mockOnPolygonDrawn = vi.fn();
    let modeChangeCallback: (() => void) | null = null;

    const mockMapInstance = {
        on: vi.fn((event: string, cb: any) => {
            if (event === 'draw.modechange') {
                modeChangeCallback = cb;
            }
        }),
        off: vi.fn(),
        queryRenderedFeatures: vi.fn().mockReturnValue([]),
        getCanvas: vi.fn(() => ({
            style: { cursor: '' },
        })),
    };

    const mockMapRef = {
        current: mockMapInstance,
    } as unknown as React.RefObject<MapRef>;

    const mockDrawRef = {
        current: {
            changeMode: vi.fn(),
            getAll: vi.fn(),
            getMode: vi.fn().mockReturnValue('simple_select'),
        },
    } as unknown as React.RefObject<MapboxDraw>;

    beforeEach(() => {
        vi.clearAllMocks();
        modeChangeCallback = null;
        mockDrawRef.current.getMode = vi.fn().mockReturnValue('simple_select');
    });

    it('does not render if isVisible is false', () => {
        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} isVisible={false} polygonDrawn={false} />);

        expect(screen.queryByLabelText('Draw polygon')).not.toBeInTheDocument();
    });

    it('renders and activates when clicked, triggering draw_polygon mode', async () => {
        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} isVisible={true} polygonDrawn={false} />);

        const button = screen.getByLabelText('Draw polygon');

        await act(() => fireEvent.click(button));

        expect(mockDrawRef.current.getMode).toHaveBeenCalled();
        expect(mockDrawRef.current.changeMode).toHaveBeenCalledWith('draw_polygon');
        expect(mockMapInstance.on).toHaveBeenCalledWith('draw.modechange', expect.any(Function));
    });

    it('does not activate if polygonDrawn is true', async () => {
        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} isVisible={true} polygonDrawn={true} />);

        const button = screen.getByLabelText('Draw polygon');

        await act(() => fireEvent.click(button));

        expect(mockDrawRef.current.changeMode).not.toHaveBeenCalled();
    });

    it('does not activate if already in a draw mode', async () => {
        mockDrawRef.current.getMode = vi.fn().mockReturnValue('draw_polygon');

        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} isVisible={true} polygonDrawn={false} />);

        const button = screen.getByLabelText('Draw polygon');

        await act(() => fireEvent.click(button));

        expect(mockDrawRef.current.changeMode).not.toHaveBeenCalledWith('draw_polygon');
    });

    it('does not break if drawRef is null', async () => {
        const nullDrawRef = { current: null } as unknown as React.RefObject<MapboxDraw>;

        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={nullDrawRef} onPolygonDrawn={mockOnPolygonDrawn} isVisible={true} polygonDrawn={false} />);

        const button = screen.getByLabelText('Draw polygon');

        await act(() => fireEvent.click(button));

        expect(mockOnPolygonDrawn).not.toHaveBeenCalled();
    });

    it('does not break if mapRef is null', async () => {
        const nullMapRef = { current: null } as unknown as React.RefObject<MapRef>;

        render(<DrawPolygonButton mapRef={nullMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} isVisible={true} polygonDrawn={false} />);

        const button = screen.getByLabelText('Draw polygon');

        await act(() => fireEvent.click(button));

        expect(mockDrawRef.current.changeMode).not.toHaveBeenCalled();
    });

    it('triggers onPolygonDrawn after drawing a polygon', async () => {
        const mockPolygon: FeatureCollection<Geometry, GeoJsonProperties> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [0, 0],
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

        const getAllMock = vi.fn().mockReturnValue(mockPolygon);
        mockDrawRef.current.getAll = getAllMock;

        render(<DrawPolygonButton mapRef={mockMapRef} drawRef={mockDrawRef} onPolygonDrawn={mockOnPolygonDrawn} isVisible={true} polygonDrawn={false} />);

        const button = screen.getByLabelText('Draw polygon');

        await act(() => fireEvent.click(button));
        expect(mockDrawRef.current.changeMode).toHaveBeenCalledWith('draw_polygon');

        await act(() => {
            if (modeChangeCallback) modeChangeCallback();
        });

        expect(mockDrawRef.current.changeMode).toHaveBeenCalledWith('simple_select', { featureIds: [] });
        expect(mockOnPolygonDrawn).toHaveBeenCalledWith(mockPolygon);
    });

    it('prevents editing existing polygon on map click', () => {
        const mockChangeMode = vi.fn();
        const mockQueryRenderedFeatures = vi.fn().mockReturnValue([{}]);
        const mockMode = vi.fn().mockReturnValue('simple_select');

        const map = {
            on: vi.fn(),
            off: vi.fn(),
            queryRenderedFeatures: mockQueryRenderedFeatures,
        };

        const draw = {
            changeMode: mockChangeMode,
            getAll: vi.fn(),
            getMode: mockMode,
        };

        const mapRef = { current: map } as unknown as React.RefObject<MapRef>;
        const drawRef = { current: draw } as unknown as React.RefObject<MapboxDraw>;

        const { unmount } = render(
            <DrawPolygonButton mapRef={mapRef} drawRef={drawRef} onPolygonDrawn={mockOnPolygonDrawn} isVisible={true} polygonDrawn={true} />
        );

        const clickHandler = map.on.mock.calls.find((call) => call[0] === 'click')?.[1];
        expect(clickHandler).toBeDefined();

        const fakeEvent = {
            point: { x: 10, y: 10 },
            preventDefault: vi.fn(),
        };

        clickHandler(fakeEvent as any);

        expect(mockQueryRenderedFeatures).toHaveBeenCalled();
        expect(mockChangeMode).toHaveBeenCalledWith('simple_select', { featureIds: [] });
        expect(fakeEvent.preventDefault).toHaveBeenCalled();

        unmount();
        expect(map.off).toHaveBeenCalledWith('click', expect.any(Function));
        expect(map.off).toHaveBeenCalledWith('contextmenu', expect.any(Function));
    });
});
