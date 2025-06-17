/**
 * Data Transfer Object for search matches
 * Contains location name, zoom level, latitude and longitude coordinates
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