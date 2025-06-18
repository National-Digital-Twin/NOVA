import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';

describe('Header', () => {
    const mockFetch = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    beforeEach(() => {
        vi.clearAllMocks();
        window.fetch = mockFetch;
    });

    it('renders header with title', () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ email: 'test@example.com' }),
        });

        render(<Header />);
        expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
    });

    it('handles fetch error gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        render(<Header />);
        expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user data:', expect.any(Error));
        });
    });

    it('renders the NOVA logo', () => {
        render(<Header />);
        expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
    });

    it('renders the UserMenu component', () => {
        render(<Header />);
        expect(screen.getByLabelText('account of current user')).toBeInTheDocument();
    });
});
