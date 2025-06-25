import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssetMarker from './AssetMarker';

describe('AssetMarker', () => {
    const lat = 50.66;
    const lng = -1.28;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    vi.mock('react-map-gl/maplibre', async () => {
        const actual = await vi.importActual('react-map-gl/maplibre');
        return {
            ...actual,
            Marker: ({ longitude, latitude, children }: { longitude: number, latitude: number, children: React.ReactNode }) => (
            <div
                data-testid="mock-marker"
                data-lng={longitude}
                data-lat={latitude}
            >
                {children}
            </div>
            ),
        };
    });

    vi.mock('../map-substations-list/substationsApi', () => ({
        fetchSubstations: vi.fn(() => [{text: 'Test', distance: 1}]),
    }));

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
        render(<AssetMarker longitude={lng} latitude={lat}/>);

        const marker = screen.getByAltText('Wind Turbine');
        fireEvent.click(marker);

        expect(screen.queryByLabelText('Edit')).toBeInTheDocument();
        expect(screen.queryByLabelText('Connect to grid')).toBeInTheDocument();
        expect(screen.queryByLabelText('Delete Asset')).toBeInTheDocument();
        expect(screen.queryByLabelText('Move')).toBeInTheDocument();
    });

    it('calls onBoltClick and shows substations on marker connect control click', async () => {
        const boltFn = vi.fn();
        await act(async () => render(<AssetMarker onBoltClick={boltFn} longitude={lng} latitude={lat}/>));

        const marker = screen.getByAltText('Wind Turbine');
        fireEvent.click(marker);

        const connectButton = screen.getByLabelText('Connect to grid');
        fireEvent.click(connectButton);

        await waitFor(() => {
            expect(screen.getByText('Loading substations...')).toBeInTheDocument();
        });

        expect(boltFn).toHaveBeenCalledOnce()
    });

    it('calls set marker position on marker delete control click', async () => {
        const setMarkerMock = vi.fn();
        render(<AssetMarker setMarkerPosition={setMarkerMock} longitude={lng} latitude={lat}/>);

        const marker = screen.getByAltText('Wind Turbine');
        fireEvent.click(marker);

        const deleteButton = screen.getByLabelText('Delete Asset');
        fireEvent.click(deleteButton);

        expect(setMarkerMock).toHaveBeenCalledOnce();
        expect(setMarkerMock).toHaveBeenLastCalledWith(null);
    });

    it('calls set marker position and sets placing on marker move control click', async () => {
        const setMarkerMock = vi.fn();
        const setPlacingMock = vi.fn();
        render(<AssetMarker setMarkerPosition={setMarkerMock} setPlacing={setPlacingMock} longitude={lng} latitude={lat}/>);

        const marker = screen.getByAltText('Wind Turbine');
        fireEvent.click(marker);

        const moveButton = screen.getByLabelText('Move');
        fireEvent.click(moveButton);

        expect(setMarkerMock).toHaveBeenCalledOnce();
        expect(setMarkerMock).toHaveBeenLastCalledWith(null);

        expect(setPlacingMock).toHaveBeenCalledOnce();
        expect(setPlacingMock).toHaveBeenLastCalledWith(true);
    });
});