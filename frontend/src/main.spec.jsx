import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test/test-utils';

vi.mock('react-dom/client', () => ({
    createRoot: vi.fn(() => ({
        render: vi.fn(),
    })),
}));

vi.mock('./App', () => ({
    default: () => <div data-testid="app-component" />,
}));

describe('main', () => {
    it('renders the app in strict mode', async () => {
        await import('./main');

        const { createRoot } = await import('react-dom/client');
        expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));

        const renderFn = createRoot.mock.results[0].value.render;
        expect(renderFn).toHaveBeenCalledWith(
            expect.objectContaining({
                type: React.StrictMode,
                props: expect.objectContaining({
                    children: expect.objectContaining({
                        type: expect.any(Function), // App component
                    }),
                }),
            })
        );
    });

    it('renders the app component', () => {
        renderWithTheme(<div data-testid="app-component" />);
        expect(screen.getByTestId('app-component')).toBeInTheDocument();
    });
});
