import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { MapRef } from 'react-map-gl/maplibre';
import AddAssetButton from './AddAssetButton';
import { useState } from 'react';

vi.mock('./AddAssetPanel', () => ({
    default: ({ onClose, onSelect }: { onClose: () => void; onSelect: (placing: boolean) => void }) => (
        <div data-testid="add-asset-panel">
            <button onClick={onClose}>Close Panel</button>
            <button onClick={() => onSelect(true)}>Select Asset</button>
        </div>
    ),
}));

const createMockMap = (hasHeatmap: boolean) => {
    const listeners: Record<string, Function[]> = {};

    return {
        getLayer: vi.fn((id: string) => (id === 'heatmap-layer' && hasHeatmap ? {} : undefined)),
        on: vi.fn((event, callback) => {
            listeners[event] = listeners[event] || [];
            listeners[event].push(callback);
        }),
        off: vi.fn((event, callback) => {
            listeners[event] = (listeners[event] || []).filter((fn) => fn !== callback);
        }),
        fire: (event: string) => {
            (listeners[event] || []).forEach((fn) => fn());
        },
    };
};

const mockMapRef = (hasHeatmap: boolean) =>
    ({
        current: {
            getMap: () => createMockMap(hasHeatmap),
        },
    }) as unknown as React.RefObject<MapRef>;

describe('AddAssetButton', () => {
    const mockOnAssetSelect = vi.fn();

    const TestAddAssetWrapper = ({ hasHeatmap = true }: { hasHeatmap?: boolean }) => {
        const [isPanelOpen, setIsPanelOpen] = useState(false);
        return (
            <AddAssetButton
                mapRef={mockMapRef(hasHeatmap)}
                onAssetSelect={mockOnAssetSelect}
                setIsPanelOpen={setIsPanelOpen}
                isPanelOpen={isPanelOpen}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render the button if heatmap layer is not present', async () => {
        render(<TestAddAssetWrapper hasHeatmap={false} />);
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /add asset/i })).not.toBeInTheDocument();
        });
    });

    it('renders the add asset button if heatmap layer is present', async () => {
        render(<TestAddAssetWrapper hasHeatmap={true} />);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument();
        });
    });

    it('shows the add asset text and icon when heatmap is present', async () => {
        render(<TestAddAssetWrapper hasHeatmap={true} />);
        await waitFor(() => {
            expect(screen.getByText('Add asset')).toBeInTheDocument();
            expect(screen.getByAltText('Add asset')).toBeInTheDocument();
        });
    });

    it('opens the panel when clicked', async () => {
        const user = userEvent.setup();
        render(<TestAddAssetWrapper hasHeatmap={true} />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument();
        });

        const button = screen.getByRole('button', { name: /add asset/i });
        await user.click(button);

        expect(screen.getByTestId('add-asset-panel')).toBeInTheDocument();
    });

    it('closes the panel when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<TestAddAssetWrapper hasHeatmap={true} />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument();
        });

        const button = screen.getByRole('button', { name: /add asset/i });
        await user.click(button);

        const closeButton = screen.getByRole('button', { name: /close panel/i });
        await user.click(closeButton);

        expect(screen.queryByTestId('add-asset-panel')).not.toBeInTheDocument();
    });

    it('calls onAssetSelect and closes panel when asset is selected', async () => {
        const user = userEvent.setup();
        render(<TestAddAssetWrapper hasHeatmap={true} />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument();
        });

        const button = screen.getByRole('button', { name: /add asset/i });
        await user.click(button);

        const selectButton = screen.getByRole('button', { name: /select asset/i });
        await user.click(selectButton);

        expect(mockOnAssetSelect).toHaveBeenCalledWith(true);
        expect(screen.queryByTestId('add-asset-panel')).not.toBeInTheDocument();
    });
});
