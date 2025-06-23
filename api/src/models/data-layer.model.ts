import { DataLayerAttribute } from './data-layer-attribute.model';

export interface DataLayerDto {
    name: string;
    attributes: DataLayerAttribute[];
    analyze: boolean;
}
