/**
 * Data Transfer Object for position information
 * Contains latitude and longitude coordinates
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PositionDTO:
 *       type: object
 *       description: Contains latitude and longitude coordinates
 *       properties:
 *         latitude:
 *           type: number
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           description: Longitude coordinate
 *       required:
 *         - latitude
 *         - longitude
 */
export interface PositionDTO {
  /**
   * Latitude coordinate
   */
  latitude: number;

  /**
   * Longitude coordinate
   */
  longitude: number;
}
