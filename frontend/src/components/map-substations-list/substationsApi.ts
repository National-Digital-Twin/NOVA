import type { SubstationResponse } from '../../types/substationResponse';
import type { Substation } from './SubstationsList';

/**
 * Fetches substations data from API based on coordinates
 * @param longitude - The longitude coordinate
 * @param latitude - The latitude coordinate
 * @returns Promise with the list of substations as ListItems and any error
 */
export const fetchSubstations = async (
    longitude: number,
    latitude: number
): Promise<{
    items: Substation[];
    error: string | null;
}> => {
    let error = null;
    let items: Substation[] = [];

    try {
        // Create GeoJSON point for current marker location
        const geoJsonData = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };

        const response = await fetch('/api/ui/substations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify(geoJsonData),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data: SubstationResponse[] = await response.json();
        items = data.map((item) => ({
            name: item.name,
            distanceFromTurbine: item.distance,
            coordinates: item.location.geometry.coordinates
        }));
    } catch (err) {
        console.error('Error fetching substations:', err);
        error = 'Failed to load substations';
    }

    return { items, error };
};
