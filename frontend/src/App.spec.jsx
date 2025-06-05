import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test/test-utils';
import App from './App';

vi.mock('./components/Header', () => ({
    default: () => <div data-testid="header-component" />,
}));

vi.mock('./components/MapComponent', () => ({
    default: () => <div data-testid="map-component" />,
}));

describe('App', () => {
    it('renders the header', () => {
        renderWithTheme(<App />);
        expect(screen.getByTestId('header-component')).toBeInTheDocument();
    });

    it('renders the map component', () => {
        renderWithTheme(<App />);
        expect(screen.getByTestId('map-component')).toBeInTheDocument();
    });
});
