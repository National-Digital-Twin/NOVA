import type { FeatureCollection, Geometry } from 'geojson';
import { Layer, Source } from 'react-map-gl/maplibre';

const POLYGON_COLORS = {
    'Least Suitable': '#F44336',
    'Moderate Suitability': '#FF9800',
    'Most Suitable': '#4CAF50',
} as const;

interface PolygonLayerProps {
    data: FeatureCollection<Geometry>;
}

const PolygonLayer = ({ data }: PolygonLayerProps) => {
    return (
        <Source id="api-layer" type="geojson" data={data}>
            {Object.entries(POLYGON_COLORS).map(([areaName, color]) => (
                <Layer
                    key={`${areaName}-fill`}
                    id={`${areaName}-fill`}
                    type="fill"
                    filter={['==', ['get', 'name'], areaName]}
                    paint={{
                        'fill-color': color,
                        'fill-opacity': 0.3,
                    }}
                />
            ))}
            {Object.entries(POLYGON_COLORS).map(([areaName, color]) => (
                <Layer
                    key={`${areaName}-outline`}
                    id={`${areaName}-outline`}
                    type="line"
                    filter={['==', ['get', 'name'], areaName]}
                    paint={{
                        'line-color': color,
                        'line-width': 2,
                    }}
                />
            ))}
        </Source>
    );
};

export default PolygonLayer;
