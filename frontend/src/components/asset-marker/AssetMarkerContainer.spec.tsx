import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssetMarkerContainer from './AssetMarkerContainer';
import * as mapStore from '../../stores/useMapStore';

// Mock AssetMarker component to track props
vi.mock('./AssetMarker', () => ({
    __esModule: true,
    default: ({ longitude, latitude, onDragEnd }: any) => (
        <div data-testid="mock-marker" data-lng={longitude} data-lat={latitude} onClick={() => onDragEnd(longitude + 1, latitude + 1)}>
            AssetMarker
        </div>
    ),
}));

describe('AssetMarkerContainer', () => {
    const mockSetMarkerPosition = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupStore = (markerPosition: any = null) => {
        vi.spyOn(mapStore, 'useMapStore').mockImplementation((selector: any) =>
            selector({
                markerPosition,
                setMarkerPosition: mockSetMarkerPosition,
            })
        );
    };

    it('does not render if markerPosition is null', () => {
        setupStore(null);
        const { container } = render(<AssetMarkerContainer is3D={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('does not render if is3D is true', () => {
        setupStore({ longitude: 1, latitude: 2 });
        const { container } = render(<AssetMarkerContainer is3D={true} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders AssetMarker when position is valid and not in 3D mode', () => {
        setupStore({ longitude: -5.5, latitude: 10.1 });
        render(<AssetMarkerContainer is3D={false} />);
        const marker = screen.getByTestId('mock-marker');
        expect(marker).toHaveAttribute('data-lng', '-5.5');
        expect(marker).toHaveAttribute('data-lat', '10.1');
    });

    it('calls setMarkerPosition when marker drag ends', () => {
        setupStore({ longitude: 3, latitude: 4 });
        render(<AssetMarkerContainer is3D={false} />);
        const marker = screen.getByTestId('mock-marker');
        marker.click(); // simulate drag end via onClick in mock

        expect(mockSetMarkerPosition).toHaveBeenCalledWith({ longitude: 4, latitude: 5 });
    });
});
