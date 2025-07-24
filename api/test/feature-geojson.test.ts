import { isValidGeoJSON, GeoJSONDTO } from '../src/utils/geojson.utils';

describe('Feature GeoJSON Support', () => {
  it('should validate a Feature with Point geometry', () => {
    // Example from the issue description
    const featureGeoJson: GeoJSONDTO = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [125.6, 10.1]
      },
      "properties": {
        "name": "Dinagat Islands"
      }
    };

    // Verify that the GeoJSON is valid
    expect(isValidGeoJSON(featureGeoJson)).toBe(true);
  });
});
