import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Header from './Header';

describe('Header', () => {
    it('renders the header with logo', () => {
        render(<Header />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByAltText('NOVA Logo')).toBeInTheDocument();
    });

    it('renders with correct styling', () => {
        render(<Header />);
        const header = screen.getByRole('banner');
        expect(header).toHaveClass('MuiAppBar-root');
        expect(header).toHaveClass('MuiAppBar-colorPrimary');
    });
});
