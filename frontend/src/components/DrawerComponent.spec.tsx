import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DrawerComponent from './DrawerComponent';

describe('DrawerComponent', () => {
    const mockLayerVisibility = {
        heatmap: true,
        polygons: true,
    };

    const mockOnToggleLayer = vi.fn();

    it('renders the menu button', () => {
        render(<DrawerComponent layerVisibility={mockLayerVisibility} onToggleLayer={mockOnToggleLayer} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('opens drawer when menu button is clicked', async () => {
        render(<DrawerComponent layerVisibility={mockLayerVisibility} onToggleLayer={mockOnToggleLayer} />);
        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });
        expect(screen.getByText('Layer Controls')).toBeInTheDocument();
    });

    it('renders layer controls with correct initial state', async () => {
        render(<DrawerComponent layerVisibility={mockLayerVisibility} onToggleLayer={mockOnToggleLayer} />);
        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });

        const polygonsSwitch = screen.getByLabelText('Protected Areas');
        const heatmapSwitch = screen.getByLabelText('Wind Turbines');

        expect(heatmapSwitch).toBeChecked();
        expect(polygonsSwitch).toBeChecked();
    });

    it('calls onToggleLayer when switches are clicked', async () => {
        render(<DrawerComponent layerVisibility={mockLayerVisibility} onToggleLayer={mockOnToggleLayer} />);
        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Protected Areas'));
        });
        expect(mockOnToggleLayer).toHaveBeenCalledWith('polygons');

        await act(async () => {
            fireEvent.click(screen.getByLabelText('Wind Turbines'));
        });
        expect(mockOnToggleLayer).toHaveBeenCalledWith('heatmap');
    });

    it('reflects updated layer visibility state', async () => {
        const updatedVisibility = {
            heatmap: false,
            polygons: true,
        };

        render(<DrawerComponent layerVisibility={updatedVisibility} onToggleLayer={mockOnToggleLayer} />);
        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });

        const polygonsSwitch = screen.getByLabelText('Protected Areas');
        const heatmapSwitch = screen.getByLabelText('Wind Turbines');

        expect(heatmapSwitch).not.toBeChecked();
        expect(polygonsSwitch).toBeChecked();
    });

    it('closes drawer when backdrop is clicked', async () => {
        render(<DrawerComponent layerVisibility={mockLayerVisibility} onToggleLayer={mockOnToggleLayer} />);

        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });
        expect(screen.getByText('Layer Controls')).toBeInTheDocument();

        await act(async () => {
            const backdrop = screen.getByRole('presentation').querySelector('.MuiBackdrop-root');
            if (backdrop) {
                fireEvent.click(backdrop);
            }
        });

        await waitFor(() => {
            const drawer = document.querySelector('.MuiDrawer-root');
            expect(drawer).toHaveClass('MuiModal-hidden');
        });
    });
});
