/**
 * Data models for asset information
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Specification:
 *       type: object
 *       description: Represents a specific attribute or characteristic of an asset variation
 *       properties:
 *         key:
 *           type: string
 *           description: Key identifier for the specification
 *         value:
 *           type: string
 *           description: Value of the specification
 *         unit:
 *           type: string
 *           description: Unit of measurement for the specification value
 *         displayName:
 *           type: string
 *           description: Human-readable display name for the specification
 *       required:
 *         - key
 *         - value
 *         - unit
 *         - displayName
 */
/**
 * Specification interface representing a specific attribute of an asset variation
 */
export interface Specification {
  /**
   * Key identifier for the specification
   */
  key: string;

  /**
   * Value of the specification
   */
  value: string;

  /**
   * Unit of measurement for the specification value
   */
  unit: string;

  /**
   * Human-readable display name for the specification
   */
  displayName: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Variation:
 *       type: object
 *       description: Represents a specific type or model of an asset
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the variation
 *         specification:
 *           type: array
 *           description: List of specifications for this variation
 *           items:
 *             $ref: '#/components/schemas/Specification'
 *       required:
 *         - name
 *         - specification
 */
/**
 * Variation interface representing a specific type of asset
 */
export interface Variation {
  /**
   * Name of the variation
   */
  name: string;

  /**
   * List of specifications for this variation
   */
  specification: Specification[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       description: Represents a specific asset type with its variations
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the asset
 *         name:
 *           type: string
 *           description: Human-readable name of the asset
 *         variations:
 *           type: array
 *           description: List of variations for this asset
 *           items:
 *             $ref: '#/components/schemas/Variation'
 *       required:
 *         - id
 *         - name
 *         - variations
 */
/**
 * Asset interface representing a specific asset type
 */
export interface Asset {
  /**
   * Unique identifier for the asset
   */
  id: string;

  /**
   * Human-readable name of the asset
   */
  name: string;

  /**
   * List of variations for this asset
   */
  variations: Variation[];
}

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetsDTO:
 *       type: array
 *       description: Array of Asset objects representing all available assets
 *       items:
 *         $ref: '#/components/schemas/Asset'
 */
/**
 * AssetsDTO interface representing the complete assets data structure
 * This is an array of Asset objects
 */
export type AssetsDTO = Asset[];
