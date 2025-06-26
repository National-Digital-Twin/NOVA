import { DataLayerAttribute } from './data-layer-attribute.model';

export interface DataLayerDto {
    id: string;
    attributes: DataLayerAttribute[];
    analyze: boolean;
}
