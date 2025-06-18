import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import EditPolygonButton from './EditPolygonButton';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import maplibregl from 'maplibre-gl';
import { createMockMapRef } from '../../../../test/test-utils';

// Mock popup and react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: () => ({
    render: vi.fn(),
  }),
}));

// Mock ConfirmPolygonButton to avoid actual DOM rendering
vi.mock('../../map-controls/confirm-polygon/ConfirmPolygonButton', () => ({
  __esModule: true,
  default: () => <div>Mock Confirm Button</div>,
}));

// Stub MapVisualHelper
vi.mock('../../../utils/MapVisualHelper', () => ({
  MapVisualHelper: {
    getFirstPolygon: vi.fn(() => ({
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 1], [1, 0], [0, 0]]],
    })),
    getFeatureCollection: vi.fn(() => ({
      type: 'FeatureCollection',
      features: [{ id: 'mock-id' }],
    })),
    getConfirmationPopupCoordinates: vi.fn(() => [0, 0]),
    removeDimmedMask: vi.fn(),
    removeExistingPopup: vi.fn(),
  },
}));

describe('EditPolygonButton', () => {
  let drawMock: React.RefObject<MapboxDraw | null>;
  let popupRefMock: React.RefObject<maplibregl.Popup | null>;
  const mockOnPolygonEdited = vi.fn();
  const mockHideLayerControl = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    drawMock = {
      current: {
          changeMode: vi.fn(),
          onAdd: function (map: maplibregl.Map): HTMLElement {
              throw new Error('Function not implemented.');
          },
          onRemove: function (map: maplibregl.Map): void {
              throw new Error('Function not implemented.');
          },
          getMode: function (): string {
              throw new Error('Function not implemented.');
          },
          getAll: function (): Record<string, unknown>[] {
              throw new Error('Function not implemented.');
          },
          delete: function (id: string): void {
              throw new Error('Function not implemented.');
          },
          deleteAll: function (): void {
              throw new Error('Function not implemented.');
          }
      },
    };

    popupRefMock = { current: null };
  });

  it('renders button when visible', () => {
    render(
      <EditPolygonButton
        drawRef={drawMock}
        mapRef={createMockMapRef()}
        polygonConfirmationPopUpRef={popupRefMock}
        onPolygonEdited={mockOnPolygonEdited}
        hideLayerControl={mockHideLayerControl}
        isVisible={true}
      />
    );

    expect(screen.getByLabelText('Edit polygon')).toBeInTheDocument();
  });

  it('does not render button when not visible', () => {
    render(
      <EditPolygonButton
        drawRef={drawMock}
        mapRef={createMockMapRef()}
        polygonConfirmationPopUpRef={popupRefMock}
        onPolygonEdited={mockOnPolygonEdited}
        hideLayerControl={mockHideLayerControl}
        isVisible={false}
      />
    );

    expect(screen.queryByLabelText('Edit polygon')).not.toBeInTheDocument();
  });

  it('does nothing if draw or map is null', () => {
    render(
      <EditPolygonButton
        drawRef={{ current: null }}
        mapRef={{ current: null } as any}
        polygonConfirmationPopUpRef={popupRefMock}
        onPolygonEdited={mockOnPolygonEdited}
        hideLayerControl={mockHideLayerControl}
        isVisible={true}
      />
    );

    const button = screen.getByLabelText('Edit polygon');
    fireEvent.click(button);

    expect(mockOnPolygonEdited).not.toHaveBeenCalled();
    expect(mockHideLayerControl).not.toHaveBeenCalled();
  });
});
