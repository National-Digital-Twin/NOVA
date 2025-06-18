import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ControlButton from './ControlButton';

describe('ControlButton', () => {
    it('renders with correct aria label', () => {
        render(
            <ControlButton onClick={() => {}} aria-label="Test Button">
                <span>Test</span>
            </ControlButton>
        );

        const button = screen.getByLabelText('Test Button');
        expect(button).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(
            <ControlButton onClick={handleClick} aria-label="Test Button">
                <span>Test</span>
            </ControlButton>
        );

        const button = screen.getByLabelText('Test Button');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders children correctly', () => {
        render(
            <ControlButton onClick={() => {}} aria-label="Test Button">
                <span>Test Content</span>
            </ControlButton>
        );

        const content = screen.getByText('Test Content');
        expect(content).toBeInTheDocument();
    });

    it('applies correct styling', () => {
        render(
            <ControlButton onClick={() => {}} aria-label="Test Button">
                <span>Test</span>
            </ControlButton>
        );

        const button = screen.getByLabelText('Test Button');
        expect(button).toHaveStyle({
            width: '3rem',
            height: '3.5rem',
            padding: '0',
        });
    });
});
