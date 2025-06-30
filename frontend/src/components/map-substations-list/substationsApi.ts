import type { SubstationResponse } from '../../types/substationResponse';
import type { ListItem } from './SubstationsList';

export const fetchSubstations = async (longitude: number, latitude: number): Promise<{ items: ListItem[]; error: string | null }> => {
    let error = null;
    let items: ListItem[] = [];

    try {
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
            text: item.name,
            distance: item.distance,
        }));
    } catch (err) {
        console.error('Error fetching substations:', err);
        error = 'Failed to load substations';
    }

    return { items, error };
};
