import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SubstationsList from './SubstationsList';

// Define the ListItem interface to match the one in the component
interface ListItem {
    text: string;
    distance: string;
}

describe('SubstationsList', () => {
    it('renders with default items', () => {
        const manyItems: ListItem[] = [
            { text: 'Item 1', distance: '100km' },
            { text: 'Item 2', distance: '200km' },
            { text: 'Item 3', distance: '300km' },
            { text: 'Item 4', distance: '400km' },
            { text: 'Item 5', distance: '500km' },
        ];
        render(<SubstationsList items={manyItems} />);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
        expect(screen.getByText('distance: 100km')).toBeInTheDocument();
        expect(screen.getByText('distance: 200km')).toBeInTheDocument();
        expect(screen.getByText('distance: 300km')).toBeInTheDocument();
        expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('renders with custom items', () => {
        const customItems: ListItem[] = [
            { text: 'Custom 1', distance: '150km' },
            { text: 'Custom 2', distance: '250km' },
            { text: 'Custom 3', distance: '350km' },
        ];
        render(<SubstationsList items={customItems} />);

        expect(screen.getByText('Custom 1')).toBeInTheDocument();
        expect(screen.getByText('Custom 2')).toBeInTheDocument();
        expect(screen.getByText('Custom 3')).toBeInTheDocument();
        expect(screen.getByText('distance: 150km')).toBeInTheDocument();
        expect(screen.getByText('distance: 250km')).toBeInTheDocument();
        expect(screen.getByText('distance: 350km')).toBeInTheDocument();
    });

    it('renders all items provided', () => {
        const manyItems: ListItem[] = [
            { text: 'Item 1', distance: '100km' },
            { text: 'Item 2', distance: '200km' },
            { text: 'Item 3', distance: '300km' },
            { text: 'Item 4', distance: '400km' },
            { text: 'Item 5', distance: '500km' },
        ];
        render(<SubstationsList items={manyItems} />);

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('Item 3')).toBeInTheDocument();
        expect(screen.getByText('Item 4')).toBeInTheDocument();
        expect(screen.getByText('Item 5')).toBeInTheDocument();
        expect(screen.getByText('distance: 100km')).toBeInTheDocument();
        expect(screen.getByText('distance: 200km')).toBeInTheDocument();
        expect(screen.getByText('distance: 300km')).toBeInTheDocument();
        expect(screen.getByText('distance: 400km')).toBeInTheDocument();
        expect(screen.getByText('distance: 500km')).toBeInTheDocument();
    });

    it('disables confirm button until an item is selected', () => {
        const manyItems: ListItem[] = [
            { text: 'Item 1', distance: '100km' },
            { text: 'Item 2', distance: '200km' },
            { text: 'Item 3', distance: '300km' },
            { text: 'Item 4', distance: '400km' },
            { text: 'Item 5', distance: '500km' },
        ];
        render(<SubstationsList items={manyItems} />);

        const confirmButton = screen.getByText('Confirm');
        expect(confirmButton).toBeDisabled();

        fireEvent.click(screen.getByText('Item 2'));
        expect(confirmButton).not.toBeDisabled();
    });

    it('calls onConfirm with the selected item when confirm button is clicked', () => {
        const manyItems: ListItem[] = [
            { text: 'Item 1', distance: '100km' },
            { text: 'Item 2', distance: '200km' },
            { text: 'Item 3', distance: '300km' },
            { text: 'Item 4', distance: '400km' },
            { text: 'Item 5', distance: '500km' },
        ];
        const mockOnConfirm = vi.fn();
        render(<SubstationsList items={manyItems} onConfirm={mockOnConfirm} />);

        // Select an item
        fireEvent.click(screen.getByText('Item 1'));

        // Click confirm
        fireEvent.click(screen.getByText('Confirm'));

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockOnConfirm).toHaveBeenCalledWith({ text: 'Item 1', distance: '100km' });
    });

    it('does not call onConfirm when confirm button is clicked without selection', () => {
        const mockOnConfirm = vi.fn();
        render(<SubstationsList onConfirm={mockOnConfirm} />);

        // Confirm button should be disabled, but try to click it anyway
        fireEvent.click(screen.getByText('Confirm'));

        expect(mockOnConfirm).not.toHaveBeenCalled();
    });
});
