import { render as rtlRender } from '@testing-library/react';
import type { ReactElement } from 'react';

export function render(ui: ReactElement, { ...renderOptions } = {}) {
    return rtlRender(ui, { ...renderOptions });
}
