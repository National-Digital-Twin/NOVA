/**
 * Data model for analysis request
 */
import { GeoJSON } from 'geojson';
import { AssetDTO } from './asset.model';
import { LayersDTO } from './layers.model';

/**
 * @swagger
 * components:
 *   schemas:
 *     AnalysisRequestDTO:
 *       type: object
 *       description: Represents a request for location analysis
 *       properties:
 *         location:
 *           $ref: '#/components/schemas/GeoJSONDTO'
 *           description: GeoJSON of the selected area
 *         layers:
 *           $ref: '#/components/schemas/LayersDTO'
 *           description: Layers configuration for the analysis
 *         asset:
 *           $ref: '#/components/schemas/AssetDTO'
 *           description: Asset to be analyzed
 *       required:
 *         - location
 *         - layers
 *         - asset
 */
export interface AnalysisRequestDTO {
    /**
     * GeoJSON of the selected area
     */
    location: GeoJSON;

    /**
     * Layers configuration for the analysis
     */
    layers: LayersDTO;

    /**
     * Asset to be analyzed
     */
    asset: AssetDTO;
}
