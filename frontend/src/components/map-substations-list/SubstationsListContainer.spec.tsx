import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubstationsListContainer from './SubstationsListContainer';
import * as substationsApi from './substationsApi';

// Mock the fetchSubstations function
vi.mock('./substationsApi', () => ({
    fetchSubstations: vi.fn(),
}));

describe('SubstationsListContainer', () => {
    const mockItems = [
        { text: 'Test Substation 1', distance: '150km' },
        { text: 'Test Substation 2', distance: '250km' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state when fetching data', async () => {
        // Mock the fetchSubstations function to return a promise that never resolves
        vi.spyOn(substationsApi, 'fetchSubstations').mockImplementation(() => new Promise(() => {}));

        render(<SubstationsListContainer longitude={1.23} latitude={4.56} />);

        expect(screen.getByText('Loading substations...')).toBeInTheDocument();
    });

    it('renders error state when there is an error', async () => {
        // Mock the fetchSubstations function to return an error
        vi.spyOn(substationsApi, 'fetchSubstations').mockResolvedValue({
            items: [],
            error: 'Test error message',
        });

        render(<SubstationsListContainer longitude={1.23} latitude={4.56} />);

        await waitFor(() => {
            expect(screen.getByText('Test error message')).toBeInTheDocument();
        });
    });

    it('renders SubstationsList with fetched data', async () => {
        // Mock the fetchSubstations function to return data
        vi.spyOn(substationsApi, 'fetchSubstations').mockResolvedValue({
            items: mockItems,
            error: null,
        });

        render(<SubstationsListContainer longitude={1.23} latitude={4.56} />);

        await waitFor(() => {
            expect(screen.getByText('Test Substation 1')).toBeInTheDocument();
            expect(screen.getByText('Test Substation 2')).toBeInTheDocument();
            expect(screen.getByText('distance: 150km')).toBeInTheDocument();
            expect(screen.getByText('distance: 250km')).toBeInTheDocument();
        });
    });

    it('does not fetch data if longitude or latitude is undefined', () => {
        render(<SubstationsListContainer />);

        expect(substationsApi.fetchSubstations).not.toHaveBeenCalled();
    });

    it('calls fetchSubstations with the provided coordinates', async () => {
        // Mock the fetchSubstations function to return data
        vi.spyOn(substationsApi, 'fetchSubstations').mockResolvedValue({
            items: mockItems,
            error: null,
        });

        render(<SubstationsListContainer longitude={1.23} latitude={4.56} />);

        await waitFor(() => {
            expect(substationsApi.fetchSubstations).toHaveBeenCalledWith(1.23, 4.56);
        });
    });
});
