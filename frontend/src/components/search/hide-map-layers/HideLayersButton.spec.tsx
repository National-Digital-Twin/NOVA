import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { MapRef } from 'react-map-gl/maplibre';
import { vi } from 'vitest';
import { MapVisualHelper } from '../../../utils/MapVisualHelper';
import HideLayersButton from './HideLayersButton';

describe('HideLayersButton', () => {
    const getMockMap = (hasHeatmap: boolean) => {
        return {
            getLayer: vi.fn((id: string) => (id === 'heatmap-layer' && hasHeatmap ? {} : undefined)),
            on: vi.fn((event, callback) => {
                if (event === 'styledata') callback();
            }),
            off: vi.fn(),
            getStyle: vi.fn(() => ({
                layers: [{ id: 'background' }, { id: 'basemap-road' }, { id: 'heatmap-layer' }, { id: 'custom-layer-1' }],
            })),
            setLayoutProperty: vi.fn(),
        };
    };

    const mockMapRef = (hasHeatmap: boolean) =>
        ({
            current: {
                getMap: () => getMockMap(hasHeatmap),
            },
        }) as unknown as React.RefObject<MapRef>;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('does not render the button if heatmap-layer is not present', async () => {
        render(<HideLayersButton mapRef={mockMapRef(false)} />);
        await waitFor(() => {
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });

    it('renders the button if heatmap-layer is present', async () => {
        render(<HideLayersButton mapRef={mockMapRef(true)} />);
        await waitFor(() => {
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    it('hides and shows layers when clicked', async () => {
        const hideMock = vi.spyOn(MapVisualHelper, 'hideNonBaseLayers').mockReturnValue(['custom-layer-1']);
        const showMock = vi.spyOn(MapVisualHelper, 'showLayers').mockImplementation(() => {});

        render(<HideLayersButton mapRef={mockMapRef(true)} />);
        const button = await screen.findByRole('button');

        fireEvent.click(button);
        expect(hideMock).toHaveBeenCalled();

        fireEvent.click(button);
        expect(showMock).toHaveBeenCalledWith(expect.anything(), ['custom-layer-1']);
    });
});
