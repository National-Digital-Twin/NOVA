import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssetControls from './AssetControls';

describe('AssetControls', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all buttons', () => {
        render(<AssetControls />);

        expect(screen.getByLabelText('Edit')).toBeInTheDocument();
        expect(screen.getByLabelText('Connect to grid')).toBeInTheDocument();
        expect(screen.getByLabelText('Delete Asset')).toBeInTheDocument();
        expect(screen.getByLabelText('Move')).toBeInTheDocument();
    });
});
