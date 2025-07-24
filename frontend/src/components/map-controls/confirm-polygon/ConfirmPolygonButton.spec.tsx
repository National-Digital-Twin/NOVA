import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmPolygonButton from './ConfirmPolygonButton';

describe('ConfirmPolygonButton', () => {
    it('renders the confirmation button with correct label and icon', () => {
        render(<ConfirmPolygonButton onConfirm={() => {}} />);
        const button = screen.getByRole('button', { name: /set polygon/i });

        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Set');

        const icon = screen.getByAltText('Set polygon') as HTMLImageElement;
        expect(icon).toBeInTheDocument();
        expect(icon.src).toContain('/icons/confirm-polygon.svg');
    });

    it('calls onConfirm when clicked', async () => {
        const onConfirmMock = vi.fn();
        const user = userEvent.setup();

        render(<ConfirmPolygonButton onConfirm={onConfirmMock} />);
        const button = screen.getByRole('button', { name: /set polygon/i });

        await user.click(button);

        expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });
});
