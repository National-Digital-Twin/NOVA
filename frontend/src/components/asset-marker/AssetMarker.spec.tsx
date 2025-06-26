import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssetMarker from './AssetMarker';
import * as mapStore from '../../stores/useMapStore';

vi.mock('react-map-gl/maplibre', async () => {
    const actual = await vi.importActual('react-map-gl/maplibre');
    return {
        ...actual,
        Marker: ({ longitude, latitude, children }: { longitude: number; latitude: number; children: React.ReactNode }) => (
            <div data-testid="mock-marker" data-lng={longitude} data-lat={latitude}>
                {children}
            </div>
        ),
    };
});

vi.mock('../map-substations-list/substationsApi', () => ({
    fetchSubstations: vi.fn(() => [{ text: 'Test', distance: 1 }]),
}));

vi.mock('./AssetControls', () => ({
    default: ({ onBoltClick, onDeleteClick, onMoveClick, onEditClick }: any) => (
      <>
        <button aria-label="Connect to grid" onClick={onBoltClick}>Connect</button>
        <button aria-label="Delete Asset" onClick={onDeleteClick}>Delete</button>
        <button aria-label="Move" onClick={onMoveClick}>Move</button>
        <button aria-label="Edit" onClick={onEditClick}>Edit</button>
      </>
    ),
  }));

describe('AssetMarker', () => {
    const lat = 50.66;
    const lng = -1.28;
    const setPlacingMock = vi.fn();
    const setMarkerPositionMock = vi.fn();
    const preventPolygonEditMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector) =>
            selector({
                setPlacing: setPlacingMock,
                setMarkerPosition: setMarkerPositionMock,
                preventPolygonEdit: preventPolygonEditMock,
                mapRef: null,
                setMapRef: vi.fn(),
                drawRef: null,
                setDrawRef: vi.fn(),
                placing: false,
                markerPosition: null,
                markerBearing: null,
                setMarkerBearing: vi.fn(),
                markerVariant: null,
                setMarkerVariant: vi.fn(),
                handleMapClick: vi.fn(),
                cachedHeatmap: null,
                setCachedHeatmap: vi.fn(),
            })
        );
    });

    it('renders a marker at the correct location', () => {
        render(<AssetMarker longitude={lng} latitude={lat} />);

        const marker = screen.getByTestId('mock-marker');
        expect(marker).toBeInTheDocument();
        expect(marker).toHaveAttribute('data-lng', lng.toString());
        expect(marker).toHaveAttribute('data-lat', lat.toString());
    });

    it('hides controls and substations by default', () => {
        render(<AssetMarker />);

        expect(screen.queryByLabelText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Connect to grid')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Delete Asset')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Move')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Choose Substation')).not.toBeInTheDocument();
    });

    it('shows controls on marker click', () => {
        render(<AssetMarker longitude={lng} latitude={lat} />);

        const marker = screen.getByAltText('Wind Turbine');
        fireEvent.click(marker);

        expect(screen.queryByLabelText('Edit')).toBeInTheDocument();
        expect(screen.queryByLabelText('Connect to grid')).toBeInTheDocument();
        expect(screen.queryByLabelText('Delete Asset')).toBeInTheDocument();
        expect(screen.queryByLabelText('Move')).toBeInTheDocument();
    });

    it('calls onBoltClick and shows substations on marker connect control click', async () => {
        const boltFn = vi.fn();
        render(<AssetMarker onBoltClick={boltFn} longitude={lng} latitude={lat} />);

        const marker = screen.getByAltText('Wind Turbine');
        fireEvent.click(marker);

        const connectButton = screen.getByLabelText('Connect to grid');
        fireEvent.click(connectButton);

        expect(boltFn).toHaveBeenCalledOnce();
        await waitFor(() => {
            expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });
    });

    it('calls setMarkerPosition on delete', () => {
        render(<AssetMarker longitude={lng} latitude={lat} />);

        const marker = screen.getByAltText('Wind Turbine');
        fireEvent.click(marker);

        const deleteButton = screen.getByLabelText('Delete Asset');
        fireEvent.click(deleteButton);

        expect(setMarkerPositionMock).toHaveBeenCalledOnce();
        expect(setMarkerPositionMock).toHaveBeenCalledWith(null);
    });

    it('calls setMarkerPosition and setPlacing on move', () => {
        render(<AssetMarker longitude={lng} latitude={lat} />);

        const marker = screen.getByAltText('Wind Turbine');
        fireEvent.click(marker);

        const moveButton = screen.getByLabelText('Move');
        fireEvent.click(moveButton);

        expect(setMarkerPositionMock).toHaveBeenCalledOnce();
        expect(setMarkerPositionMock).toHaveBeenCalledWith(null);
        expect(setPlacingMock).toHaveBeenCalledOnce();
        expect(setPlacingMock).toHaveBeenCalledWith(true);
    });
});
