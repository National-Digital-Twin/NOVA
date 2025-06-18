import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
    it('triggers search result callback on selecting a result', async () => {
        const mockOnSearchResultClick = vi.fn();
        const user = userEvent.setup();

        vi.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => [{ name: 'Aberdeen', latitude: 57.1497, longitude: -2.0943, zoom: 10 }],
        } as Response);

        render(<SearchInput onSearchResultClick={mockOnSearchResultClick} />);

        const input = screen.getByRole('combobox');
        await user.type(input, 'Ab');

        await waitFor(() => screen.getByText('Aberdeen'));
        await user.click(screen.getByText('Aberdeen'));

        expect(mockOnSearchResultClick).toHaveBeenCalledWith(57.1497, -2.0943, 10);
    });

    it('does not fetch suggestions if input is less than 2 characters', async () => {
        const mockOnSearchResultClick = vi.fn();
        const fetchMock = vi.spyOn(window, 'fetch');

        render(<SearchInput onSearchResultClick={mockOnSearchResultClick} />);
        const input = screen.getByRole('combobox');

        await userEvent.type(input, 'A');

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('clears suggestions when input is cleared', async () => {
        const mockOnSearchResultClick = vi.fn();

        vi.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: async () => [{ name: 'Aberdeen', latitude: 57.1497, longitude: -2.0943, zoom: 10 }],
        } as Response);

        render(<SearchInput onSearchResultClick={mockOnSearchResultClick} />);
        const input = screen.getByRole('combobox');

        await userEvent.type(input, 'Ab');
        await waitFor(() => screen.getByText('Aberdeen'));

        await userEvent.clear(input);
        await waitFor(() => {
            expect(screen.queryByText('Aberdeen')).not.toBeInTheDocument();
        });
    });
});
