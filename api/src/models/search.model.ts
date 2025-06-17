/**
 * Data Transfer Object for search matches
 * Contains location name, zoom level, latitude and longitude coordinates
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     SearchOptionDTO:
 *       type: object
 *       description: Contains location name, latitude and longitude coordinates
 *       properties:
 *         name:
 *           type: string
 *           description: Location name
 *         latitude:
 *           type: number
 *           description: Latitude coordinate
 *         longitude:
 *           type: number
 *           description: Longitude coordinate
 *       required:
 *         - name
 *         - latitude
 *         - longitude
 */
export interface SearchOptionDTO {
  /**
   * Location name
   */
  name: string;
  /**
   * Latitude coordinate
   */
  latitude: number;
  /**
   * Longitude coordinate
   */
  longitude: number;
  /**
   * Zoom level
   */
  zoom: number;
}