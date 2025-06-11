import { fireEvent, render, screen } from '@testing-library/react';
import type { MapRef } from 'react-map-gl/maplibre';
import { describe, expect, it, vi } from 'vitest';
import ViewToggleButton from './ViewToggleButton';

describe('ViewToggleButton', () => {
    const mockMap = {
        easeTo: vi.fn(),
        getPitch: () => 0,
    };

    const mockMapRef = {
        current: {
            getMap: () => mockMap,
        },
    } as unknown as React.RefObject<MapRef>;

    it('renders with 3D text initially', () => {
        render(<ViewToggleButton mapRef={mockMapRef} />);
        expect(screen.getByText('3D')).toBeInTheDocument();
    });

    it('renders with correct aria label initially', () => {
        render(<ViewToggleButton mapRef={mockMapRef} />);
        expect(screen.getByLabelText('Switch to 2D')).toBeInTheDocument();
    });

    it('toggles between 2D and 3D text when clicked', () => {
        render(<ViewToggleButton mapRef={mockMapRef} />);
        const button = screen.getByRole('button');

        expect(screen.getByText('3D')).toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.getByText('2D')).toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.getByText('3D')).toBeInTheDocument();
    });

    it('calls easeTo with correct parameters when toggling to 2D', () => {
        render(<ViewToggleButton mapRef={mockMapRef} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockMap.easeTo).toHaveBeenCalledWith({
            pitch: 0,
            duration: 300,
        });
    });

    it('calls easeTo with correct parameters when toggling to 3D', () => {
        render(<ViewToggleButton mapRef={mockMapRef} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        fireEvent.click(button);

        expect(mockMap.easeTo).toHaveBeenCalledWith({
            pitch: 60,
            duration: 300,
        });
    });
});
