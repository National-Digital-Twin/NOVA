import { DataLayerDto } from './data-layer.model';
import { FeatureCollection, Polygon } from 'geojson';

export interface AssetLocationRequestDto {
    location: FeatureCollection<Polygon>;
    dataLayers: DataLayerDto[];
}
