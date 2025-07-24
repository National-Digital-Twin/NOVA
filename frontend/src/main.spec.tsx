import { screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('./App', () => ({
    default: () => (
        <div>
            <header role="banner">
                <img alt="NOVA Logo" src="logo.svg" />
            </header>
            <div data-testid="map">Map Component</div>
        </div>
    ),
}));

describe('main', () => {
    beforeAll(() => {
        const root = document.createElement('div');
        root.id = 'root';
        document.body.appendChild(root);
    });

    afterAll(() => {
        const root = document.getElementById('root');
        if (root) {
            document.body.removeChild(root);
        }
    });

    it('renders the app with content', async () => {
        await act(async () => {
            await import('./main');
        });

        await waitFor(() => {
            expect(screen.getByRole('banner')).toBeInTheDocument();
            expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
            expect(screen.getByTestId('map')).toBeInTheDocument();
        });
    });

    it('mounts the app to the DOM', async () => {
        await act(async () => {
            await import('./main');
        });

        await waitFor(() => {
            expect(screen.getByRole('banner')).toBeInTheDocument();
            expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
            expect(screen.getByTestId('map')).toBeInTheDocument();
        });
    });
});
