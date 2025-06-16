/**
 * Data model for suitability analysis response
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SuitabilityResponseDTO:
 *       type: object
 *       description: Represents the result of an asset suitability analysis
 *       properties:
 *         suitabilityPercentage:
 *           type: number
 *           description: Percentage indicating how suitable the asset is for the location
 *         suitabilityDescription:
 *           type: string
 *           description: Textual description of the suitability analysis
 *       required:
 *         - suitabilityPercentage
 *         - suitabilityDescription
 */
/**
 * SuitabilityResponseDTO interface representing the result of an asset suitability analysis
 */
export interface SuitabilityResponseDTO {
  /**
   * Percentage indicating how suitable the asset is for the location
   */
  suitabilityPercentage: number;

  /**
   * Textual description of the suitability analysis
   */
  suitabilityDescription: string;
}