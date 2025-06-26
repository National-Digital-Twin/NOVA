import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssetControls from './AssetControls';

describe('AssetControls', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all buttons', () => {
        render(
            <AssetControls
                onBoltClick={function (): void {
                    throw new Error('Function not implemented.');
                }}
                onDeleteClick={function (): void {
                    throw new Error('Function not implemented.');
                }}
                onEditClick={function (): void {
                    throw new Error('Function not implemented.');
                }}
                onMoveClick={function (): void {
                    throw new Error('Function not implemented.');
                }}
            />
        );

        expect(screen.getByLabelText('Edit')).toBeInTheDocument();
        expect(screen.getByLabelText('Connect to grid')).toBeInTheDocument();
        expect(screen.getByLabelText('Delete Asset')).toBeInTheDocument();
        expect(screen.getByLabelText('Move')).toBeInTheDocument();
    });
});
