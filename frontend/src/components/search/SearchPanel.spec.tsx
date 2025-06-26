import { render, screen } from '@testing-library/react';
import type { FeatureCollection, Geometry } from 'geojson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockMapRef } from '../../../test/test-utils';
import SearchPanel from './SearchPanel';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';

const mockDrawRef = { current: {} } as unknown as React.RefObject<MapboxDraw>;

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
            aria-label="Search by region or country"
        />
    ),
}));

vi.mock('./draw-polygon/DrawPolygonButton', () => ({
    default: ({ onPolygonDrawn }: { onPolygonDrawn: (feature: FeatureCollection<Geometry>) => void }) => (
        <button
            data-testid="draw-polygon-button"
            onClick={() => {
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
            }}
        >
            Draw Polygon
        </button>
    ),
}));

vi.mock('./delete-polygon/DeletePolygonButton', () => ({
    default: ({ onPolygonDeleted }: { onPolygonDeleted: () => void }) => (
        <button data-testid="delete-polygon-button" onClick={onPolygonDeleted}>
            Delete Polygon
        </button>
    ),
}));

vi.mock('./edit-polygon/EditPolygonButton', () => ({
    default: ({ onPolygonEdited }: { onPolygonEdited: () => void }) => (
        <button data-testid="edit-polygon-button" onClick={onPolygonEdited}>
            Edit Polygon
        </button>
    ),
}));

vi.mock('./polygon-layer/PolygonLayer', () => ({
    default: ({ data }: { data: FeatureCollection<Geometry> }) => <div data-testid="polygon-layer" data-features={JSON.stringify(data.features)} />,
}));

describe('SearchPanel', () => {
    const mockMapRef = createMockMapRef();

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

    it('renders search input and draw button by default', () => {
        render(
            <SearchPanel
                mapRef={mockMapRef}
                showLayerControl={() => {}}
                hideLayerControl={() => {}}
                drawRef={mockDrawRef}
                isPanelOpen={false}
                setIsPanelOpen={() => {}}
            />
        );
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByTestId('draw-polygon-button')).toBeInTheDocument();
    });
});
