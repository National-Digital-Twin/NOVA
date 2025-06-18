import { render as rtlRender } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { vi } from 'vitest';

export function render(ui: ReactElement, { ...renderOptions } = {}) {
  return rtlRender(ui, { ...renderOptions });
}

/**
 * Creates a mock MapRef object for use in testing components
 * that rely on MapLibre's map instance and methods.
 *
 * @returns A mocked React ref object with a `getMap` method.
 */
export function createMockMapRef(): React.RefObject<MapRef> {
  const mockMap = {
    flyTo: vi.fn(),
    addControl: vi.fn(),
    removeControl: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    getContainer: vi.fn(() => document.createElement('div')),
    getMap: vi.fn().mockReturnValue('mock-map'),
    queryRenderedFeatures: vi.fn(),
    transform: {
      projection: {
        getCoveringTilesDetailsProvider: vi.fn().mockReturnValue(() => ({
          coveringTiles: [],
          zoom: 0,
        })),
      },
    },
  };

  return {
    current: {
      getMap: vi.fn().mockReturnValue(mockMap),
    },
  } as unknown as React.RefObject<MapRef>;
}
