import type { Point } from 'geojson';

export interface SubstationResponse {
    id: number;
    name: string;
    distance: string;
    location: {
        geometry: Point;
    };
}
