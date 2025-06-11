import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SidebarComponent from './SidebarComponent';

describe('DrawerComponent', () => {
    const mockLayerVisibility = {
        heatmap: true,
        polygons: true,
    };

    const mockOnToggleLayer = vi.fn();

    beforeEach(() => {
        mockOnToggleLayer.mockClear();
    });

    it('renders and handles drawer interactions', () => {
        render(<SidebarComponent layerVisibility={mockLayerVisibility} onToggleLayer={mockOnToggleLayer} />);

        const menuButton = screen.getByRole('button');
        expect(menuButton).toBeInTheDocument();

        fireEvent.click(menuButton);
        expect(screen.getByText('Layer Controls')).toBeInTheDocument();

        const polygonsSwitch = screen.getByLabelText('Protected Areas');
        const heatmapSwitch = screen.getByLabelText('Wind Turbines');
        expect(heatmapSwitch).toBeChecked();
        expect(polygonsSwitch).toBeChecked();

        fireEvent.click(polygonsSwitch);
        expect(mockOnToggleLayer).toHaveBeenCalledWith('polygons');

        fireEvent.click(heatmapSwitch);
        expect(mockOnToggleLayer).toHaveBeenCalledWith('heatmap');
    });

    it('reflects updated layer visibility state', () => {
        const updatedVisibility = {
            heatmap: false,
            polygons: true,
        };

        render(<SidebarComponent layerVisibility={updatedVisibility} onToggleLayer={mockOnToggleLayer} />);

        fireEvent.click(screen.getByRole('button'));

        const polygonsSwitch = screen.getByLabelText('Protected Areas');
        const heatmapSwitch = screen.getByLabelText('Wind Turbines');
        expect(heatmapSwitch).not.toBeChecked();
        expect(polygonsSwitch).toBeChecked();
    });

    it('closes drawer when backdrop is clicked', async () => {
        render(<SidebarComponent layerVisibility={mockLayerVisibility} onToggleLayer={mockOnToggleLayer} />);

        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('Layer Controls')).toBeInTheDocument();

        const backdrop = document.querySelector('.MuiBackdrop-root');
        if (backdrop) {
            fireEvent.click(backdrop);
        }

        await waitFor(
            () => {
                const hiddenBackdrop = document.querySelector('.MuiBackdrop-root');
                expect(hiddenBackdrop).toHaveStyle({ opacity: '0' });
                expect(hiddenBackdrop).toHaveStyle({ visibility: 'hidden' });
            },
            { timeout: 1000 }
        );
    });
});
