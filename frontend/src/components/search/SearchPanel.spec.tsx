import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchPanel from './SearchPanel';
import { createMockMapRef } from '../../../test/test-utils';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';

// Mocks
const mockDrawRef = { current: {} } as unknown as React.RefObject<MapboxDraw>;
const mockMapRef = createMockMapRef();

vi.mock('../../stores/useMapStore', () => ({
    useMapStore: vi.fn().mockImplementation((selector) => selector({ cachedHeatmap: null })),
}));

vi.mock('../../hooks/usePolygonHandlers', () => ({
    usePolygonHandlers: () => ({
        startPolygonDraw: vi.fn(),
        handlePolygonDeleted: vi.fn(),
        startPolygonEdit: vi.fn(),
    }),
}));

vi.mock('./search-input/SearchInput', () => ({
    default: ({ onSearchResultClick }: { onSearchResultClick: (lat: number, lon: number, zoom: number) => void }) => (
        <input
            type="text"
            data-testid="search-input"
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    onSearchResultClick(57.1497, -2.0943, 10);
                }
            }}
            aria-label="Search by region"
        />
    ),
}));

vi.mock('./draw-polygon/DrawPolygonButton', () => ({
    default: ({ startPolygonDraw }: { startPolygonDraw: () => void }) => (
        <button data-testid="draw-polygon-button" onClick={startPolygonDraw}>
            Draw Polygon
        </button>
    ),
}));

vi.mock('./delete-polygon/DeletePolygonButton', () => ({
    default: ({ deletePolygon }: { deletePolygon: () => void }) => (
        <button data-testid="delete-polygon-button" onClick={deletePolygon}>
            Delete Polygon
        </button>
    ),
}));

vi.mock('./edit-polygon/EditPolygonButton', () => ({
    default: ({ startPolygonEdit }: { startPolygonEdit: () => void }) => (
        <button data-testid="edit-polygon-button" onClick={startPolygonEdit}>
            Edit Polygon
        </button>
    ),
}));

vi.mock('./hide-map-layers/HideLayersButton', () => ({
    default: () => <button data-testid="hide-layers-button">Hide Layers</button>,
}));

vi.mock('./add-asset/AddAssetButton', () => ({
    default: ({ isPanelOpen, setIsPanelOpen }: { isPanelOpen: boolean; setIsPanelOpen: (open: boolean) => void }) => (
        <button
            data-testid="add-asset-button"
            onClick={() => {
                setIsPanelOpen(!isPanelOpen);
            }}
        >
            Toggle Panel
        </button>
    ),
}));

// Actual tests
describe('SearchPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all main controls', () => {
        render(<SearchPanel mapRef={mockMapRef} drawRef={mockDrawRef} isPanelOpen={false} setIsPanelOpen={() => {}} />);

        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByTestId('draw-polygon-button')).toBeInTheDocument();
        expect(screen.getByTestId('delete-polygon-button')).toBeInTheDocument();
        expect(screen.getByTestId('edit-polygon-button')).toBeInTheDocument();
        expect(screen.getByTestId('hide-layers-button')).toBeInTheDocument();
        expect(screen.getByTestId('add-asset-button')).toBeInTheDocument();
    });
});
