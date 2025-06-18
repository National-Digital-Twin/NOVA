import * as turf from '@turf/turf';
import { SubstationService, substationService } from '../src/services/substation.service';
import { dataProviderUtils } from '../src/utils/data-provider.utils';
import { Feature, FeatureCollection, GeoJSON, Point, Polygon } from 'geojson';
import { LocationsDTO } from '../src/models/location.model';
import { isValidGeoJSON } from '../src/utils/geojson.utils';

// Mock dataProviderUtils
jest.mock('../src/utils/data-provider.utils');

// Mock @turf/turf
jest.mock('@turf/turf', () => ({
  point: (coords: number[]) => ({ type: 'Point', coordinates: coords }),
  distance: (from: any, to: any) => {
    // Simple mock implementation of distance calculation
    const fromCoords = from.coordinates;
    const toCoords = to.coordinates;
    const dx = fromCoords[0] - toCoords[0];
    const dy = fromCoords[1] - toCoords[1];
    return Math.sqrt(dx * dx + dy * dy);
  }
}));

describe('SubstationService', () => {
  let service: SubstationService;

  beforeEach(() => {
    service = new SubstationService();

    // Mock the readGSPData method
    const mockGSPData: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            "Owner Type": "SSEN",
            "Owner Name": "DOAN",
            "Type": "Primary",
            "Class": "Distribution",
            "Number": "BEAP"
          },
          geometry: {
            type: "Point",
            coordinates: [0.01, 0.01]
          }
        },
        {
          type: "Feature",
          properties: {
            "Owner Type": "SSEN",
            "Owner Name": "DOAN",
            "Type": "Secondary",
            "Class": "Transmission",
            "Number": "79181002"
          },
          geometry: {
            type: "Point",
            coordinates: [-0.01, 0.02]
          }
        },
        {
          type: "Feature",
          properties: {
            "Owner Type": "SSEN",
            "Owner Name": "DOAN",
            "Type": "Primary",
            "Class": "Distribution",
            "Number": "ROMI"
          },
          geometry: {
            type: "Point",
            coordinates: [0.02, -0.01]
          }
        },
        {
          type: "Feature",
          properties: {
            "Owner Type": "SSEN",
            "Owner Name": "DOAN",
            "Type": "Primary",
            "Class": "Distribution",
            "Number": "DADO"
          },
          geometry: {
            type: "Point",
            coordinates: [0.03, 0.03]
          }
        },
        {
          type: "Feature",
          properties: {
            "Owner Type": "SSEN",
            "Owner Name": "DOAN",
            "Type": "Primary",
            "Class": "Distribution",
            "Number": "THAM"
          },
          geometry: {
            type: "Point",
            coordinates: [-0.03, -0.03]
          }
        }
      ]
    };
    (dataProviderUtils.readGSPData as jest.Mock).mockReturnValue(mockGSPData);
  });

  describe('extractPointFromGeoJSON', () => {
    it('should return the Feature with Point geometry', () => {
      const geoJson: Feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      };

      const result = service.extractPointFromGeoJSON(geoJson);

      expect(result).toEqual(geoJson);
    });

    it('should return the first Feature from a FeatureCollection with Point geometry', () => {
      const feature: Feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      };

      const geoJson: FeatureCollection = {
        type: "FeatureCollection",
        features: [feature]
      };

      const result = service.extractPointFromGeoJSON(geoJson);

      expect(result).toEqual(feature);
    });

    it('should convert a Point geometry to a Feature', () => {
      const geoJson: GeoJSON = {
        type: "Point",
        coordinates: [0, 0]
      };

      // Mock isValidGeoJSON to return true for this test
      const originalIsValidGeoJSON = jest.requireActual('../src/utils/geojson.utils').isValidGeoJSON;
      jest.spyOn(require('../src/utils/geojson.utils'), 'isValidGeoJSON').mockReturnValue(true);

      const result = service.extractPointFromGeoJSON(geoJson);

      // Restore the original isValidGeoJSON function
      jest.spyOn(require('../src/utils/geojson.utils'), 'isValidGeoJSON').mockRestore();

      expect(result).toEqual({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      });
    });

    it('should return null for invalid GeoJSON', () => {
      const geoJson = {
        // Missing required 'type' property
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        }
      } as any;

      const result = service.extractPointFromGeoJSON(geoJson);

      expect(result).toBeNull();
    });

    it('should return null for GeoJSON without a Point geometry', () => {
      const geoJson: Feature = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        properties: {}
      };

      const result = service.extractPointFromGeoJSON(geoJson);

      expect(result).toBeNull();
    });
  });

  describe('findNearestSubstations', () => {
    it('should find the nearest substations to a Feature with Point geometry', () => {
      const point: Feature<Point> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      };

      const result = service.findNearestSubstations(point);

      expect(result).toHaveLength(3);
      expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
      expect(result[1].distance).toBeLessThanOrEqual(result[2].distance);
      expect(result[0].name).toBe("BEAP");
      expect((result[0].location.geometry as Point)?.coordinates).toEqual([0.01, 0.01]);
    });

    it('should limit the number of substations returned', () => {
      const point: Feature<Point> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      };

      const result = service.findNearestSubstations(point, 2);

      expect(result).toHaveLength(2);
    });

    it('should handle features without geometry', () => {
      const point: Feature<Point> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      };

      // Mock the readGSPData method with a feature without geometry
      const mockGSPData: FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              "Number": "BEAP"
            },
            // Empty geometry that will be filtered out
            geometry: {
              type: "Point",
              coordinates: []
            }
          },
          {
            type: "Feature",
            properties: {
              "Number": "79181002"
            },
            geometry: {
              type: "Point",
              coordinates: [-0.01, 0.02]
            }
          }
        ]
      };
      (dataProviderUtils.readGSPData as jest.Mock).mockReturnValue(mockGSPData);

      const result = service.findNearestSubstations(point);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("79181002");
    });
  });

  describe('getNearestSubstations', () => {
    it('should get the nearest substations to a location', () => {
      const geoJson: Feature<Point> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      };

      // Mock the extractPointFromGeoJSON method to return a Feature with Point geometry
      const extractPointSpy = jest.spyOn(service, 'extractPointFromGeoJSON').mockReturnValue({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {}
      } as Feature<Point>);

      // Mock the findNearestSubstations method to return a non-empty array
      const findNearestSpy = jest.spyOn(service, 'findNearestSubstations').mockReturnValue([
        {
          location: {
            type: 'Feature',
            properties: {
              "Number": "BEAP"
            },
            geometry: {
              type: "Point",
              coordinates: [0.01, 0.01]
            }
          },
          name: "BEAP",
          distance: 0.014142135623730951
        },
        {
          location: {
            type: 'Feature',
            properties: {
              "Number": "79181002"
            },
            geometry: {
              type: "Point",
              coordinates: [-0.01, 0.02]
            }
          },
          name: "79181002",
          distance: 0.022360679774997898
        },
        {
          location: {
            type: 'Feature',
            properties: {
              "Number": "ROMI"
            },
            geometry: {
              type: "Point",
              coordinates: [0.02, -0.01]
            }
          },
          name: "ROMI",
          distance: 0.022360679774997898
        }
      ]);

      const result = service.getNearestSubstations(geoJson);

      // Restore the original methods
      extractPointSpy.mockRestore();
      findNearestSpy.mockRestore();

      expect(result).toHaveLength(3);
      expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
      expect(result[1].distance).toBeLessThanOrEqual(result[2].distance);
      expect(result[0].name).toBe("BEAP");
      expect((result[0].location.geometry as Point)?.coordinates).toEqual([0.01, 0.01]);
    });

    it('should return an empty array for invalid GeoJSON', () => {
      const geoJson = {
        // Missing required 'type' property
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        }
      } as any;

      const result = service.getNearestSubstations(geoJson);

      expect(result).toEqual([]);
    });

    it('should return an empty array for GeoJSON without a Point geometry', () => {
      const geoJson: Feature<Polygon> = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        properties: {}
      };

      const result = service.getNearestSubstations(geoJson);

      expect(result).toEqual([]);
    });
  });
});
