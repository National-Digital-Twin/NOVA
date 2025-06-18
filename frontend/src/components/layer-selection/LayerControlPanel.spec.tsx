import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LayerControlPanel from './LayerControlPanel';

describe('LayerControlPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders panel with header and apply button', () => {
    render(<LayerControlPanel />);
    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  it('renders some layer names and their checkboxes', () => {
    render(<LayerControlPanel />);
    expect(screen.getByText('Areas of outstanding natural beauty')).toBeInTheDocument();
    expect(screen.getByText('Wind speed')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('toggles checkbox state when clicked', async () => {
    render(<LayerControlPanel />);
    const checkbox = screen.getByLabelText('Wind speed');
    expect((checkbox as HTMLInputElement).checked).toBe(true);
    await userEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(false);
  });

  it('filters layers by search input', async () => {
    render(<LayerControlPanel />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, 'built up');

    expect(screen.getByText('Built up areas')).toBeInTheDocument();
    expect(screen.queryByText('Wind speed')).not.toBeInTheDocument();
  });

  it('shows "No results" for unmatched search', async () => {
    render(<LayerControlPanel />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, 'nonexistent');

    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    render(<LayerControlPanel />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, 'Wind');

    const clearBtn = screen.getByLabelText('Clear search');
    await userEvent.click(clearBtn);

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('Wind speed')).toBeInTheDocument();
  });

  it('shows no results when search is only spaces', async () => {
    render(<LayerControlPanel />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, '   ');
  
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('does not render categories with no items', () => {
    render(<LayerControlPanel />);
    expect(screen.queryByText('Consumption')).not.toBeInTheDocument();
    expect(screen.queryByText('Network infrastructure')).not.toBeInTheDocument();
  });

  it('does not render accordion for categories with no matching layers', async () => {
    render(<LayerControlPanel />);
    const searchInput = screen.getByPlaceholderText('Search for layers');
    await userEvent.type(searchInput, 'wind');

    expect(screen.queryByText('Residential')).not.toBeInTheDocument();
    expect(screen.getByText('Wind speed')).toBeInTheDocument();
  });

  it('toggles accordion expansion', async () => {
    render(<LayerControlPanel />);
    const summary = screen.getByText('Environmental protected sites');
    await userEvent.click(summary); // Collapse
    await userEvent.click(summary); // Expand
    expect(screen.getByText('Areas of outstanding natural beauty')).toBeInTheDocument();
  });

  it('calls console.log with selected layers on apply', async () => {
    const logSpy = vi.spyOn(console, 'log');
    render(<LayerControlPanel />);
    const applyBtn = screen.getByRole('button', { name: /apply/i });
    await userEvent.click(applyBtn);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Selected layers:'), expect.arrayContaining([
      'Areas of outstanding natural beauty',
      'Wind speed'
    ]));
  });

  it('collapses and expands the panel with toggle button', async () => {
    render(<LayerControlPanel />);
    const toggleBtn = screen.getAllByRole('button')[0];
    await userEvent.click(toggleBtn); // Collapse
    expect(screen.queryByText('Layers')).not.toBeInTheDocument();

    await userEvent.click(toggleBtn); // Expand again
    expect(screen.getByText('Layers')).toBeInTheDocument();
  });

  it('rotates toggle icon when collapsed', async () => {
    render(<LayerControlPanel />);
    const toggleBtn = screen.getAllByRole('button')[0];
    await userEvent.click(toggleBtn); // Collapse
  
    const icon = toggleBtn.querySelector('svg');
    const styles = window.getComputedStyle(icon as Element);
  
    expect(styles.transform).toMatch(/rotate\(180deg\)/);
  });

  it('matches snapshot', () => {
    const { container } = render(<LayerControlPanel />);
    expect(container).toMatchSnapshot();
  });
});
