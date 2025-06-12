import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MapStylePanel from './MapStylePanel';

describe('MapStylePanel', () => {
    const mockOnStyleChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders style button', () => {
        render(<MapStylePanel currentStyle="hybrid" onStyleChange={mockOnStyleChange} />);
        expect(screen.getByLabelText('Change map style')).toBeInTheDocument();
    });

    it('shows panel when button is clicked', () => {
        render(<MapStylePanel currentStyle="hybrid" onStyleChange={mockOnStyleChange} />);

        fireEvent.click(screen.getByLabelText('Change map style'));
        expect(screen.getByText('Map Styles')).toBeInTheDocument();
    });

    it('renders all map style options', () => {
        render(<MapStylePanel currentStyle="hybrid" onStyleChange={mockOnStyleChange} />);

        fireEvent.click(screen.getByLabelText('Change map style'));
        expect(screen.getByLabelText('Basic')).toBeInTheDocument();
        expect(screen.getByLabelText('Streets')).toBeInTheDocument();
        expect(screen.getByLabelText('Satellite')).toBeInTheDocument();
        expect(screen.getByLabelText('Bright')).toBeInTheDocument();
    });

    it('marks current style as selected', () => {
        render(<MapStylePanel currentStyle="hybrid" onStyleChange={mockOnStyleChange} />);

        fireEvent.click(screen.getByLabelText('Change map style'));
        const selectedRadio = screen.getByLabelText('Satellite') as HTMLInputElement;
        expect(selectedRadio.checked).toBe(true);
    });

    it('calls onStyleChange and closes panel when new style is selected', () => {
        render(<MapStylePanel currentStyle="hybrid" onStyleChange={mockOnStyleChange} />);

        fireEvent.click(screen.getByLabelText('Change map style'));
        fireEvent.click(screen.getByLabelText('Basic'));

        expect(mockOnStyleChange).toHaveBeenCalledWith('basic');
        expect(screen.queryByText('Map Styles')).not.toBeInTheDocument();
    });

    it('does not call onStyleChange when same style is selected', () => {
        render(<MapStylePanel currentStyle="hybrid" onStyleChange={mockOnStyleChange} />);

        fireEvent.click(screen.getByLabelText('Change map style'));
        fireEvent.click(screen.getByLabelText('Satellite'));

        expect(mockOnStyleChange).not.toHaveBeenCalled();
    });

    it('closes panel when clicking button again', () => {
        render(<MapStylePanel currentStyle="hybrid" onStyleChange={mockOnStyleChange} />);

        fireEvent.click(screen.getByLabelText('Change map style'));
        expect(screen.getByText('Map Styles')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Change map style'));
        expect(screen.queryByText('Map Styles')).not.toBeInTheDocument();
    });
});
