import '@testing-library/jest-dom';
import { vi } from 'vitest';

const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock for maplibre-gl and other browser APIs that don't exist in JSDOM
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');