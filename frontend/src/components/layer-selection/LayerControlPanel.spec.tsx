import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LayerControlPanel from './LayerControlPanel';
import { MapVisualHelper } from '../../utils/MapVisualHelper';
import type { MapRef } from 'react-map-gl/maplibre';

const mockMapRef = { current: {} } as unknown as React.RefObject<MapRef>;

// A minimal fake GeoJSON
const fakeGeoJSON = {
  type: 'FeatureCollection',
  features: [],
};

describe('LayerControlPanel', () => {
  let fetchSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    // mock global.fetch
    fetchSpy = vi
      .spyOn(global, 'fetch' as any)
      .mockResolvedValue({
        ok: true,
        json: async () => fakeGeoJSON,
      } as Response);

    // spy on map helper
    vi.spyOn(MapVisualHelper, 'addOrUpdateHeatmapLayer').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders panel with header and apply button', () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  it('renders some layer names and their checkboxes', () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    expect(
      screen.getByText('Areas of outstanding natural beauty')
    ).toBeInTheDocument();
    expect(screen.getByText('Wind speed')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('toggles checkbox state when clicked', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const checkbox = screen.getByLabelText('Wind speed');
    expect((checkbox as HTMLInputElement).checked).toBe(true);
    await userEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(false);
  });

  it('filters layers by search input', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, 'built up');

    expect(screen.getByText('Built up areas')).toBeInTheDocument();
    expect(screen.queryByText('Wind speed')).not.toBeInTheDocument();
  });

  it('shows "No results" for unmatched search', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, 'nonexistent');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, 'Wind');

    const clearBtn = screen.getByLabelText('Clear search');
    await userEvent.click(clearBtn);

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('Wind speed')).toBeInTheDocument();
  });

  it('shows no results when search is only spaces', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, '   ');

    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('does not render categories with no items', () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    expect(screen.queryByText('Consumption')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Network infrastructure')
    ).not.toBeInTheDocument();
  });

  it('does not render accordion for categories with no matching layers', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, 'wind');

    expect(screen.queryByText('Residential')).not.toBeInTheDocument();
    expect(screen.getByText('Wind speed')).toBeInTheDocument();
  });

  it('toggles accordion expansion', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const summary = screen.getByText('Environmental protected sites');
    await userEvent.click(summary); // Collapse
    await userEvent.click(summary); // Expand
    expect(
      screen.getByText('Areas of outstanding natural beauty')
    ).toBeInTheDocument();
  });

  it('collapses and expands the panel with toggle button', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const toggleBtn = screen.getAllByRole('button')[0];
    await userEvent.click(toggleBtn); // Collapse
    expect(screen.queryByText('Layers')).not.toBeInTheDocument();

    await userEvent.click(toggleBtn); // Expand again
    expect(screen.getByText('Layers')).toBeInTheDocument();
  });

  it('rotates toggle icon when collapsed', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    const toggleBtn = screen.getAllByRole('button')[0];
    await userEvent.click(toggleBtn); // Collapse

    const icon = toggleBtn.querySelector('svg');
    const styles = window.getComputedStyle(icon as Element);
    expect(styles.transform).toMatch(/rotate\(180deg\)/);
  });

  it('renders all userAdjustableParameters in the drawer', async () => {
    render(<LayerControlPanel mapRef={mockMapRef} />);
    // open drawer for a known layer
    const targetBtn = screen
      .getAllByRole('button')
      .find(btn => btn.parentElement?.textContent?.includes('Areas of outstanding natural beauty'));
    await userEvent.click(targetBtn!);

    const input = screen.getByLabelText('Distance from layer');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('2');
  });
});
