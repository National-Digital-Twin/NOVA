import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SubstationResponse } from '../../types/substationResponse';
import { fetchSubstations } from './substationsApi';

global.fetch = vi.fn();

describe('substationsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('fetches substations successfully', async () => {
        const mockSubstations: SubstationResponse[] = [
            { name: 'Substation A', distance: '1.5' },
            { name: 'Substation B', distance: '2.3' },
        ];

        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockSubstations),
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await fetchSubstations(123.456, 78.901);

        expect(global.fetch).toHaveBeenCalledWith('/api/ui/substations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
                type: 'Point',
                coordinates: [123.456, 78.901],
            }),
        });

        expect(result.items).toEqual([
            { text: 'Substation A', distance: '1.5' },
            { text: 'Substation B', distance: '2.3' },
        ]);
        expect(result.error).toBeNull();
    });

    it('handles API error response', async () => {
        const mockResponse = {
            ok: false,
            status: 500,
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await fetchSubstations(123.456, 78.901);

        expect(result.items).toEqual([]);
        expect(result.error).toBe('Failed to load substations');
        expect(console.error).toHaveBeenCalledWith('Error fetching substations:', expect.any(Error));
    });

    it('handles network error', async () => {
        const networkError = new Error('Network error');
        (global.fetch as any).mockRejectedValue(networkError);

        const result = await fetchSubstations(123.456, 78.901);

        expect(result.items).toEqual([]);
        expect(result.error).toBe('Failed to load substations');
        expect(console.error).toHaveBeenCalledWith('Error fetching substations:', networkError);
    });

    it('handles empty response data', async () => {
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue([]),
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await fetchSubstations(123.456, 78.901);

        expect(result.items).toEqual([]);
        expect(result.error).toBeNull();
    });

    it('handles single substation response', async () => {
        const mockSubstations: SubstationResponse[] = [{ name: 'Single Substation', distance: '0.5' }];

        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockSubstations),
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await fetchSubstations(0, 0);

        expect(result.items).toEqual([{ text: 'Single Substation', distance: '0.5' }]);
        expect(result.error).toBeNull();
    });

    it('handles JSON parsing error', async () => {
        const mockResponse = {
            ok: true,
            json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await fetchSubstations(123.456, 78.901);

        expect(result.items).toEqual([]);
        expect(result.error).toBe('Failed to load substations');
        expect(console.error).toHaveBeenCalledWith('Error fetching substations:', expect.any(Error));
    });

    it('handles different coordinate values', async () => {
        const mockSubstations: SubstationResponse[] = [{ name: 'Test Substation', distance: '1.0' }];

        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockSubstations),
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await fetchSubstations(-180, -90);

        expect(global.fetch).toHaveBeenCalledWith('/api/ui/substations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
                type: 'Point',
                coordinates: [-180, -90],
            }),
        });

        expect(result.items).toEqual([{ text: 'Test Substation', distance: '1.0' }]);
        expect(result.error).toBeNull();
    });

    it('handles substations with zero distance', async () => {
        const mockSubstations: SubstationResponse[] = [{ name: 'Zero Distance Substation', distance: '0' }];

        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockSubstations),
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await fetchSubstations(123.456, 78.901);

        expect(result.items).toEqual([{ text: 'Zero Distance Substation', distance: '0' }]);
        expect(result.error).toBeNull();
    });

    it('handles substations with decimal distances', async () => {
        const mockSubstations: SubstationResponse[] = [{ name: 'Decimal Distance Substation', distance: '3.14159' }];

        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue(mockSubstations),
        };

        (global.fetch as any).mockResolvedValue(mockResponse);

        const result = await fetchSubstations(123.456, 78.901);

        expect(result.items).toEqual([{ text: 'Decimal Distance Substation', distance: '3.14159' }]);
        expect(result.error).toBeNull();
    });
});
