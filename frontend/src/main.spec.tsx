import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./components/MapComponent', () => ({
    default: () => <div data-testid="map-component" />,
}));

describe('main', () => {
    it('renders the app with content', () => {
        render(<App />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
        expect(screen.getByTestId('map-component')).toBeInTheDocument();
    });

    it('mounts the app to the DOM', async () => {
        const root = document.createElement('div');
        root.id = 'root';
        document.body.appendChild(root);

        await act(async () => {
            await import('./main');
        });

        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
        expect(screen.getByTestId('map-component')).toBeInTheDocument();

        document.body.removeChild(root);
    });
});
