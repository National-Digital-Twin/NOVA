import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../test/test-utils';
import Header from './Header';

describe('Header', () => {
    it('renders the header with logo', () => {
        renderWithTheme(<Header />);
        const header = screen.getByRole('banner');
        expect(header).toBeInTheDocument();
        expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
    });

    it('applies correct styling', () => {
        renderWithTheme(<Header />);
        const header = screen.getByRole('banner');
        const logo = screen.getByAltText('NOVA Logo');

        expect(header).toHaveStyle({
            position: 'relative',
        });

        expect(logo).toHaveStyle({
            height: '2rem',
        });
    });
});
