import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../test/test-utils';
import SidePanel from './SidePanel';

describe('SidePanel', () => {
    const defaultProps = {
        onLayerToggle: vi.fn(),
        layerVisibility: {
            protectedAreas: false,
            windTurbines: false,
        },
        onDrawerToggle: vi.fn(),
        isOpen: true,
    };

    it('renders the menu button when drawer is closed', () => {
        renderWithTheme(<SidePanel {...defaultProps} isOpen={false} />);
        const menuButton = screen.getByRole('button', { name: /menu/i });
        expect(menuButton).toBeInTheDocument();
    });

    it('calls onDrawerToggle when menu button is clicked', () => {
        renderWithTheme(<SidePanel {...defaultProps} isOpen={false} />);
        const menuButton = screen.getByRole('button', { name: /menu/i });
        fireEvent.click(menuButton);
        expect(defaultProps.onDrawerToggle).toHaveBeenCalled();
    });

    it('renders layer toggles when drawer is open', () => {
        renderWithTheme(<SidePanel {...defaultProps} />);
        expect(screen.getByText('Protected Areas')).toBeInTheDocument();
        expect(screen.getByText('Wind Turbines')).toBeInTheDocument();
    });

    it('calls onLayerToggle when a layer switch is toggled', () => {
        renderWithTheme(<SidePanel {...defaultProps} />);
        const switches = screen.getAllByRole('checkbox');

        switches.forEach(toggle => {
            fireEvent.click(toggle);
        });

        expect(defaultProps.onLayerToggle).toHaveBeenCalledTimes(2);
        expect(defaultProps.onLayerToggle).toHaveBeenCalledWith('protectedAreas');
        expect(defaultProps.onLayerToggle).toHaveBeenCalledWith('windTurbines');
    });

    it('displays correct tab content', () => {
        renderWithTheme(<SidePanel {...defaultProps} />);
        expect(screen.getByText('Layers')).toBeInTheDocument();
    });
});
