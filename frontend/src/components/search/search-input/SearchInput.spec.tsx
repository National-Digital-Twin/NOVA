import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
    it('triggers search on enter key press', async () => {
        const mockOnSearch = vi.fn();
        const user = userEvent.setup({ delay: null });
        render(<SearchInput onSearch={mockOnSearch} />);

        const input = screen.getByLabelText('Search by region or country') as HTMLInputElement;
        await user.type(input, 'Aberdeen{enter}');

        expect(mockOnSearch).toHaveBeenCalledWith('Aberdeen');
    });

    it('does not trigger search on enter with empty input', async () => {
        const mockOnSearch = vi.fn();
        const user = userEvent.setup({ delay: null });
        render(<SearchInput onSearch={mockOnSearch} />);

        const input = screen.getByLabelText('Search by region or country') as HTMLInputElement;
        await user.type(input, '   {enter}');

        expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('trims whitespace from input on enter', async () => {
        const mockOnSearch = vi.fn();
        const user = userEvent.setup({ delay: null });
        render(<SearchInput onSearch={mockOnSearch} />);

        const input = screen.getByLabelText('Search by region or country') as HTMLInputElement;
        await user.type(input, '  Aberdeen  {enter}');

        expect(mockOnSearch).toHaveBeenCalledWith('Aberdeen');
    });
});
