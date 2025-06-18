import { render, screen, waitFor } from '@testing-library/react';
import type { FeatureCollection, Geometry } from 'geojson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchPanel from './SearchPanel';
import { createMockMapRef } from '../../../test/test-utils';

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
  default: ({ data }: { data: FeatureCollection<Geometry> }) => (
    <div data-testid="polygon-layer" data-features={JSON.stringify(data.features)} />
  ),
}));

describe('SearchPanel', () => {

  const mockFlyTo = vi.fn();

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
    render(<SearchPanel mapRef={mockMapRef} showLayerControl={() => {}} hideLayerControl={() => {}} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('draw-polygon-button')).toBeInTheDocument();
  });

  // it('flies to selected location on Enter', async () => {
  //   const user = userEvent.setup();
  //   render(<SearchPanel mapRef={mockMapRef} showLayerControl={() => {}} hideLayerControl={() => {}} />);
  //   const input = screen.getByTestId('search-input');
  //   await user.type(input, '{enter}');

  //   await waitFor(() => {
  //     expect(mockFlyTo).toHaveBeenCalledWith({
  //       center: [-2.0943, 57.1497],
  //       zoom: 10,
  //       duration: 2000,
  //     });
  //   });
  // });

  // it('shows delete and edit buttons after drawing and confirming a polygon', async () => {
  //   render(<SearchPanel mapRef={mockMapRef} showLayerControl={() => {}} hideLayerControl={() => {}} />);
  //   const drawButton = screen.getByTestId('draw-polygon-button');
  //   await userEvent.click(drawButton);

  //   expect(screen.getByTestId('delete-polygon-button')).toBeInTheDocument();
  //   expect(screen.getByTestId('edit-polygon-button')).toBeInTheDocument();
  // });

//   it('loads and displays PolygonLayer when data is set', async () => {
//     const mockFeatures: FeatureCollection<Geometry> = {
//       type: 'FeatureCollection',
//       features: [
//         {
//           type: 'Feature',
//           geometry: {
//             type: 'Polygon',
//             coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
//           },
//           properties: {},
//         },
//       ],
//     };

//     (window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
//       json: () => Promise.resolve(mockFeatures),
//     });

//     render(<SearchPanel mapRef={mockMapRef} showLayerControl={() => {}} hideLayerControl={() => {}} />);
//     const drawButton = screen.getByTestId('draw-polygon-button');
//     await userEvent.click(drawButton);

//     await waitFor(() => {
//       expect(screen.getByTestId('polygon-layer')).toBeInTheDocument();
//       expect(screen.getByTestId('polygon-layer')).toHaveAttribute(
//         'data-features',
//         JSON.stringify(mockFeatures.features)
//       );
//     });
//   });

//   it('handles fetch error gracefully', async () => {
//     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
//     const error = new Error('Fetch error');

//     (window.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

//     render(<SearchPanel mapRef={mockMapRef} showLayerControl={() => {}} hideLayerControl={() => {}} />);
//     const drawButton = screen.getByTestId('draw-polygon-button');
//     await userEvent.click(drawButton);

//     await waitFor(() => {
//       expect(consoleSpy).toHaveBeenCalledWith('Error processing polygon data:', error);
//     });

//     consoleSpy.mockRestore();
//   });
});
