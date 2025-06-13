import { isValidGeoJSON } from '../src/models/geojson.model';

describe('GeoJSON Model', () => {
  describe('isValidGeoJSON', () => {
    it('should return false for null or undefined input', () => {
      expect(isValidGeoJSON(null)).toBe(false);
      expect(isValidGeoJSON(undefined)).toBe(false);
    });

    it('should return false for input without a type property', () => {
      expect(isValidGeoJSON({})).toBe(false);
      expect(isValidGeoJSON({ properties: {} })).toBe(false);
    });

    it('should return false for input with an invalid type', () => {
      expect(isValidGeoJSON({ type: 'InvalidType' })).toBe(false);
      expect(isValidGeoJSON({ type: 'NotGeoJSON' })).toBe(false);
    });

    it('should return true for valid Point GeoJSON', () => {
      const point = {
        type: 'Point',
        coordinates: [125.6, 10.1]
      };
      expect(isValidGeoJSON(point)).toBe(true);
    });

    it('should return true for valid LineString GeoJSON', () => {
      const lineString = {
        type: 'LineString',
        coordinates: [
          [125.6, 10.1],
          [115.6, 20.1]
        ]
      };
      expect(isValidGeoJSON(lineString)).toBe(true);
    });

    it('should return true for valid Polygon GeoJSON', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [
            [125.6, 10.1],
            [115.6, 20.1],
            [135.6, 30.1],
            [125.6, 10.1]
          ]
        ]
      };
      expect(isValidGeoJSON(polygon)).toBe(true);
    });

    it('should return true for valid Feature GeoJSON', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [125.6, 10.1]
        },
        properties: {
          name: 'Test Point'
        }
      };
      expect(isValidGeoJSON(feature)).toBe(true);
    });

    it('should return true for valid FeatureCollection GeoJSON', () => {
      const featureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1]
            },
            properties: {
              name: 'Test Point'
            }
          }
        ]
      };
      expect(isValidGeoJSON(featureCollection)).toBe(true);
    });

    it('should return false for Feature without geometry', () => {
      const invalidFeature = {
        type: 'Feature',
        properties: {
          name: 'Invalid Feature'
        }
      };
      expect(isValidGeoJSON(invalidFeature)).toBe(false);
    });

    it('should return false for FeatureCollection without features array', () => {
      const invalidFeatureCollection = {
        type: 'FeatureCollection',
        properties: {
          name: 'Invalid FeatureCollection'
        }
      };
      expect(isValidGeoJSON(invalidFeatureCollection)).toBe(false);
    });
  });
});