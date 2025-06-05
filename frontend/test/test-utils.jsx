import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';

const theme = createTheme();

export function renderWithTheme(ui, options) {
    return render(ui, {
        wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
        ...options,
    });
}
