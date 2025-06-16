import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MapLegendPanel from './MapLegendPanel';

describe('MapLegendPanel', () => {
    it('renders the legend button', () => {
        render(<MapLegendPanel />);
        expect(screen.getByLabelText('Show map legend')).toBeInTheDocument();
    });

    it('shows panel when button is clicked', () => {
        render(<MapLegendPanel />);
        fireEvent.click(screen.getByLabelText('Show map legend'));
        expect(screen.getByText('Legend')).toBeInTheDocument();
        expect(screen.getByText('Location Suitability')).toBeInTheDocument();
    });

    it('hides panel when button is clicked again', () => {
        render(<MapLegendPanel />);
        const button = screen.getByLabelText('Show map legend');

        fireEvent.click(button);
        expect(screen.getByText('Legend')).toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.queryByText('Legend')).not.toBeInTheDocument();
    });

    it('displays all legend items with correct colors', () => {
        render(<MapLegendPanel />);
        fireEvent.click(screen.getByLabelText('Show map legend'));

        expect(screen.getByText('Most Suitable')).toBeInTheDocument();
        expect(screen.getByText('Moderate Suitability')).toBeInTheDocument();
        expect(screen.getByText('Least Suitable')).toBeInTheDocument();

        const colorLines = screen.getAllByTestId('color-line');
        expect(colorLines).toHaveLength(3);
        expect(colorLines[0]).toHaveStyle({ backgroundColor: '#4CAF50' });
        expect(colorLines[1]).toHaveStyle({ backgroundColor: '#FF9800' });
        expect(colorLines[2]).toHaveStyle({ backgroundColor: '#F44336' });
    });
});
