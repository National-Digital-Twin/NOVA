/**
 * Data models for GeoJSON objects
 */

/**
 * GeoJSON interface representing a GeoJSON object
 * This is a simplified version of the GeoJSON specification
 */
export interface GeoJSON {
  /**
   * Type of GeoJSON object
   */
  type: string;

  /**
   * Optional properties of the GeoJSON object
   */
  properties?: Record<string, any>;

  /**
   * Geometry of the GeoJSON object
   */
  geometry?: {
    /**
     * Type of geometry
     */
    type: string;

    /**
     * Coordinates of the geometry
     */
    coordinates: any;
  };

  /**
   * Features of the GeoJSON object (for FeatureCollection)
   */
  features?: GeoJSON[];

  /**
   * Bounding box of the GeoJSON object
   * For 2D coordinates: [west, south, east, north]
   * For 3D coordinates: [west, south, min_elevation, east, north, max_elevation]
   */
  bbox?: number[];
}

/**
 * Validates if the provided data is a valid GeoJSON object
 * @param data The data to validate
 * @returns True if the data is a valid GeoJSON object, false otherwise
 */
export function isValidGeoJSON(data: any): boolean {
  // Check if data exists and has a type property
  if (!data || !data.type) {
    return false;
  }

  // Valid GeoJSON types
  const validTypes = [
    "Point", "MultiPoint", "LineString", "MultiLineString", 
    "Polygon", "MultiPolygon", "GeometryCollection", 
    "Feature", "FeatureCollection"
  ];

  // Check if the type is valid
  if (!validTypes.includes(data.type)) {
    return false;
  }

  // Additional validation based on type
  switch (data.type) {
    case "Feature":
      // A Feature must have a geometry property
      return data.geometry !== undefined && typeof data.geometry === 'object';

    case "FeatureCollection":
      // A FeatureCollection must have a features array
      return Array.isArray(data.features);

    case "GeometryCollection":
      // A GeometryCollection must have a geometries array
      // Note: This is not in our GeoJSON model but is part of the GeoJSON spec
      return Array.isArray(data.geometries);

    // For geometry types, they must have coordinates
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
    case "Polygon":
    case "MultiPolygon":
      // These are direct geometry objects, not part of our GeoJSON model
      // but we're validating raw GeoJSON input
      return data.coordinates !== undefined;

    default:
      return false;
  }
}
