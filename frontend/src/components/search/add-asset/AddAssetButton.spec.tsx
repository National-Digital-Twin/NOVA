import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AddAssetButton from './AddAssetButton';
import { useState } from 'react';
import * as mapStore from '../../../stores/useMapStore';

vi.mock('../../../stores/useMapStore', async () => {
    const actual = await vi.importActual('../../../stores/useMapStore');
    return {
        ...actual,
        useMapStore: vi.fn(),
    };
});

vi.mock('./AddAssetPanel', () => ({
    default: ({ onClose, onSelect }: { onClose: () => void; onSelect: () => void }) => (
        <div data-testid="add-asset-panel">
            <button aria-label="Close panel" onClick={onClose}>Close Panel</button>
            <button aria-label="Select asset" onClick={onSelect}>Select Asset</button>
        </div>
    ),
}));

describe('AddAssetButton', () => {
    const setPlacingMock = vi.fn();

    const TestAddAssetWrapper = () => {
        const [isPanelOpen, setIsPanelOpen] = useState(false);
        return (
            <AddAssetButton
                setIsPanelOpen={setIsPanelOpen}
                isPanelOpen={isPanelOpen}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (mapStore.useMapStore as unknown as vi.Mock).mockImplementation((selector) =>
            selector({
                setPlacing: setPlacingMock,
                cachedHeatmap: { mock: 'data' },
            })
        );
    });

    it('renders the add asset button if heatmap layer is present', async () => {
        render(<TestAddAssetWrapper />);
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument();
        });
    });

    it('shows the add asset text and icon when heatmap is present', async () => {
        render(<TestAddAssetWrapper />);
        await waitFor(() => {
            expect(screen.getByText('Add asset')).toBeInTheDocument();
            expect(screen.getByAltText('Add asset')).toBeInTheDocument();
        });
    });

    it('opens the panel when clicked', async () => {
        const user = userEvent.setup();
        render(<TestAddAssetWrapper />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument();
        });

        const button = screen.getByRole('button', { name: /add asset/i });
        await user.click(button);

        expect(screen.getByTestId('add-asset-panel')).toBeInTheDocument();
    });

    it('closes the panel when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<TestAddAssetWrapper />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument();
        });

        const button = screen.getByRole('button', { name: /add asset/i });
        await user.click(button);

        const closeButton = screen.getByRole('button', { name: /close panel/i });
        await user.click(closeButton);

        expect(screen.queryByTestId('add-asset-panel')).not.toBeInTheDocument();
    });

    it('calls setPlacing and closes panel when asset is selected', async () => {
        const user = userEvent.setup();
        render(<TestAddAssetWrapper />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /add asset/i })).toBeInTheDocument();
        });

        const button = screen.getByRole('button', { name: /add asset/i });
        await user.click(button);

        const selectButton = screen.getByRole('button', { name: /select asset/i });
        await user.click(selectButton);

        expect(setPlacingMock).toHaveBeenCalledWith(true);
        expect(screen.queryByTestId('add-asset-panel')).not.toBeInTheDocument();
    });
});
