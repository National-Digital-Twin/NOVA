import * as fs from 'fs';
import * as path from 'path';
import { dataProviderUtils } from '../src/utils/data-provider.utils';
import { LayersDTO } from '../src/models/layers.model';
import { AssetsDTO } from '../src/models/asset.model';
import { GeoJSONDTO } from '../src/models/geojson.model';
import { LocationsDTO } from '../src/models/location.model';

// Mock fs module
jest.mock('fs');

describe('DataProviderUtils', () => {
  // Mock file paths
  const mockLayersPath = path.join(__dirname, '../src/data/layers.json');
  const mockAssetsPath = path.join(__dirname, '../src/data/assets.json');
  const mockGeoJsonPath = path.join(__dirname, '../src/data/sampleGeoJson.json');
  const mockSubstationsPath = path.join(__dirname, '../src/data/substations.json');
  const mockRegionsPath = path.join(__dirname, '../src/data/regions.json');

  // Sample data for mocking file reads
  const mockLayersData: LayersDTO = {
    categories: [
      {
        name: 'Test Category',
        items: [
          {
            id: 'testItem',
            name: 'Test Item',
            attributes: [],
            active: true
          },
          {
            id: 'testItem2',
            name: 'Test Item 2',
            attributes: []
            // active property intentionally omitted to test default value assignment
          }
        ]
      }
    ]
  };

  const mockAssetsData: AssetsDTO = [
    {
      id: 'testAsset',
      name: 'Test Asset',
      variations: [
        {
          name: 'Test Variation',
          specification: [
            {
              key: 'testSpec',
              value: 'testValue',
              unit: 'testUnit',
              displayName: 'Test Specification'
            }
          ]
        }
      ]
    }
  ];

  const mockGeoJsonData: GeoJSONDTO = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        }
      }
    ]
  };

  const mockSubstationsData: LocationsDTO = [
    {
      name: 'Test Substation',
      location: {
        type: 'Point',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        }
      },
      distance: 1.5
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
  });

  describe('readLayersData', () => {
    it('should read and parse layers data from file', () => {
      // Create a deep copy of the mock data to avoid modifications affecting the original
      const mockData = JSON.parse(JSON.stringify(mockLayersData));

      // Mock fs.readFileSync to return our mock data
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData));

      // Call the method
      const result = dataProviderUtils.readLayersData();

      // Verify fs.readFileSync was called with the correct path
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('layers.json'), 'utf8');

      // Since the method adds the active property, we need to add it to our expected result
      mockData.categories.forEach((category: any) => {
        category.items.forEach((item: any) => {
          if (item.active === undefined) {
            item.active = false;
          }
        });
      });

      // Verify the result
      expect(result).toEqual(mockData);
    });

    it('should set active property to false if it is undefined', () => {
      // Mock fs.readFileSync to return our mock data
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockLayersData));

      // Call the method
      const result = dataProviderUtils.readLayersData();

      // Verify that all items have the active property
      result.categories.forEach(category => {
        category.items.forEach(item => {
          expect(item).toHaveProperty('active');
        });
      });

      // Verify that the second item now has active set to false
      expect(result.categories[0].items[1].active).toBe(false);
    });
  });

  describe('readAssetsData', () => {
    it('should read and parse assets data from file', () => {
      // Mock fs.readFileSync to return our mock data
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockAssetsData));

      // Call the method
      const result = dataProviderUtils.readAssetsData();

      // Verify fs.readFileSync was called with the correct path
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('assets.json'), 'utf8');

      // Verify the result
      expect(result).toEqual(mockAssetsData);
    });
  });

  describe('readSampleGeoJsonData', () => {
    it('should read and parse sample GeoJSON data from file', () => {
      // Mock fs.readFileSync to return our mock data
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockGeoJsonData));

      // Call the method
      const result = dataProviderUtils.readSampleGeoJsonData();

      // Verify fs.readFileSync was called with the correct path
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('sampleGeoJson.json'), 'utf8');

      // Verify the result
      expect(result).toEqual(mockGeoJsonData);
    });
  });

  describe('readSubstationsData', () => {
    it('should read and parse substations data from file', () => {
      // Mock fs.readFileSync to return our mock data
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSubstationsData));

      // Call the method
      const result = dataProviderUtils.readSubstationsData();

      // Verify fs.readFileSync was called with the correct path
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('substations.json'), 'utf8');

      // Verify the result
      expect(result).toEqual(mockSubstationsData);
    });
  });
});
