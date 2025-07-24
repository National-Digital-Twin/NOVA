import '@testing-library/jest-dom';
import { vi } from 'vitest';

const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
