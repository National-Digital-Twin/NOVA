import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./components/map/MapComponent', () => ({
    default: () => <div data-testid="map">Map Component</div>,
}));

describe('App', () => {
    it('renders the header and map', () => {
        render(<App />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
        expect(screen.getByTestId('map')).toBeInTheDocument();
    });
});
