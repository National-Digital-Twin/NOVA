import type { Point } from "geojson";

export interface SubstationResponse {
    name: string;
    distance: string;
    location: {
        geometry: Point;
    };
}
