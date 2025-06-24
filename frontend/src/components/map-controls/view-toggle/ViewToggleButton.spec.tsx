import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { MapRef } from 'react-map-gl/maplibre';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ViewToggleButton from './ViewToggleButton';
import type { MapStyle } from '../../../types/map';

describe('ViewToggleButton', () => {
    let mockMap: any;
    let mockMapRef: React.RefObject<MapRef>;

    beforeEach(() => {
        // Minimal stub of MapLibre API needed by our component
        mockMap = {
            easeTo: vi.fn(),
            isMoving: () => false,
            isStyleLoaded: () => true,
            once: (_evt: string, cb: () => void) => {
                cb();
            },
            getSource: () => null,
            addSource: vi.fn(),
            setTerrain: vi.fn(),
        };
        mockMapRef = {
            current: {
                getMap: () => mockMap,
            },
        } as unknown as React.RefObject<MapRef>;
    });

    function setup(initial3D: boolean, initialStyle: MapStyle) {
        const onStyleChange = vi.fn();
        const setIs3D = vi.fn();
        render(<ViewToggleButton mapRef={mockMapRef} onStyleChange={onStyleChange} is3D={initial3D} setIs3D={setIs3D} currentStyle={initialStyle} />);
        const button = screen.getByRole('button');
        return { button, onStyleChange, setIs3D };
    }

    it('renders "3D" when is3D is false', () => {
        setup(false, 'basic');
        expect(screen.getByText('3D')).toBeInTheDocument();
        expect(screen.getByLabelText('Switch to 3D')).toBeInTheDocument();
    });

    it('renders "2D" when is3D is true', () => {
        setup(true, 'hybrid');
        expect(screen.getByText('2D')).toBeInTheDocument();
        expect(screen.getByLabelText('Switch to 2D')).toBeInTheDocument();
    });

    it('toggles into 3D: calls onStyleChange("satellite"), setIs3D(true), and easeTo({ pitch: 60, duration: 400 })', () => {
        const { button, onStyleChange, setIs3D } = setup(false, 'hybrid');

        // click to go into 3D
        fireEvent.click(button);

        expect(onStyleChange).toHaveBeenCalledWith('satellite');
        expect(setIs3D).toHaveBeenCalledWith(true);
        expect(mockMap.easeTo).toHaveBeenCalledWith({
            pitch: 60,
            duration: 400,
        });
    });

    it('toggles back to 2D: calls onStyleChange(previousStyle), setIs3D(false), and easeTo({ pitch: 0, duration: 400 })', () => {
        // Simulate initial 3D and previous style "hybrid"
        const { button, onStyleChange, setIs3D } = setup(true, 'hybrid');

        // click to go back to 2D
        fireEvent.click(button);

        // should restore to the saved style ('hybrid')
        expect(onStyleChange).toHaveBeenCalledWith('hybrid');
        expect(setIs3D).toHaveBeenCalledWith(false);
        expect(mockMap.easeTo).toHaveBeenCalledWith({
            pitch: 0,
            duration: 400,
        });
    });
});
