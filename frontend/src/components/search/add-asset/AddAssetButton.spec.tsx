import { describe, vi } from 'vitest';
import AddAssetButton from './AddAssetButton';
import { fireEvent, render, screen } from '@testing-library/react';

describe('AddPolygonButton', () => {
    const setPlacingMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls setsPlacing with true when button is clicked', () => {
        render(<AddAssetButton setPlacing={setPlacingMock} />);

        const button = screen.getByLabelText('Add asset');
        fireEvent.click(button);

        expect(setPlacingMock).toHaveBeenCalled();
    });

});