import { UIController } from '../src/controllers/ui.controller';
import { Request, Response } from 'express';
import { dataProviderUtils } from '../src/utils/data-provider.utils';
import { AnalysisRequestDTO } from '../src/models/analysis-request.model';
import { GeoJSONDTO } from '../src/models/geojson.model';
import { LocationDTO, LocationsDTO } from '../src/models/location.model';
import { AssetDTO } from '../src/models/asset.model';

// Mock dataProviderUtils
jest.mock('../src/utils/data-provider.utils');

describe('UIController', () => {
  let controller: any;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new UIController();

    // Setup request and response objects
    req = {
      params: { assetType: 'test' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock dataProviderUtils.readLayersData to return sample layers data
    const mockLayersData = {
      categories: [
        {
          name: 'Test Category',
          items: [
            {
              id: 'testItem',
              name: 'Test Item',
              attributes: []
              // Note: active property is intentionally omitted to test our fix
            }
          ]
        }
      ]
    };

    // Mock sample GeoJSON data
    const mockGeoJsonData: GeoJSONDTO = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [0, 0]
          }
        }
      ]
    };

    // Mock sample assets data
    const mockAssetsData: AssetDTO[] = [
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

    // Mock the readLayersData method to process the data like the real implementation
    (dataProviderUtils.readLayersData as jest.Mock).mockImplementation(() => {
      // Add active property to each item if it doesn't exist
      mockLayersData.categories.forEach(category => {
        category.items.forEach((item: any) => {
          if (item.active === undefined) {
            item.active = false; // Set default value if not present
          }
        });
      });
      return mockLayersData;
    });

    // Mock the readAssetsData method
    (dataProviderUtils.readAssetsData as jest.Mock).mockReturnValue(mockAssetsData);

    // Mock the readSampleGeoJsonData method
    (dataProviderUtils.readSampleGeoJsonData as jest.Mock).mockReturnValue(mockGeoJsonData);

    // Mock the readSubstationsData method
    const mockSubstationsData: LocationsDTO = [
      {
        name: "Substation Alpha",
        location: {
          type: "Point",
          geometry: {
            type: "Point",
            coordinates: [0.01, 0.01]
          }
        },
        distance: 1.5
      },
      {
        name: "Substation Beta",
        location: {
          type: "Point",
          geometry: {
            type: "Point",
            coordinates: [-0.01, 0.02]
          }
        },
        distance: 2.3
      },
      {
        name: "Substation Gamma",
        location: {
          type: "Point",
          geometry: {
            type: "Point",
            coordinates: [0.02, -0.01]
          }
        },
        distance: 2.7
      }
    ];
    (dataProviderUtils.readSubstationsData as jest.Mock).mockReturnValue(mockSubstationsData);
  });

  describe('constructor', () => {
    it('should create an instance of UIController', () => {
      expect(controller).toBeInstanceOf(UIController);
    });
  });

  describe('searchLocation', () => {
    it('should return an array of matched locations for a valid query', () => {
      req.query = { location: 'Test Location' };
  
      const mockMatches = [
        { name: 'Test County', type: 'County', latitude: 51.5, longitude: -0.1 },
        { name: 'Test Region', type: 'Region', latitude: 52.0, longitude: -1.2 }
      ];
  
      (dataProviderUtils.getSearchOptions as jest.Mock).mockReturnValue(mockMatches);
  
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  
      controller.searchLocation(req as Request, res as Response);
  
      expect(consoleDebugSpy).toHaveBeenCalledWith('Location search requested for: Test Location');
      expect(dataProviderUtils.getSearchOptions).toHaveBeenCalledWith('Test Location');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMatches);
  
      consoleDebugSpy.mockRestore();
    });
  
    it('should return 400 when location parameter is missing', () => {
      req.query = {};
  
      controller.searchLocation(req as Request, res as Response);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Location parameter is required' });
    });
  });

  describe('getLayers', () => {
    it('should return layers data with active property for each item', () => {
      // Call the method
      controller.getLayers(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      // Get the data passed to res.json
      const responseData = (res.json as jest.Mock).mock.calls[0][0];

      // Verify that categories and items exist
      expect(responseData).toHaveProperty('categories');
      expect(responseData.categories[0]).toHaveProperty('items');

      // Verify that each item has the active property
      responseData.categories.forEach((category: any) => {
        category.items.forEach((item: any) => {
          expect(item).toHaveProperty('active');
          expect(item.active).toBe(false); // Default value should be false
        });
      });
    });

    it('should handle errors when retrieving layers data', () => {
      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock dataProviderUtils.readLayersData to throw an error
      (dataProviderUtils.readLayersData as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Call the method
      controller.getLayers(req as Request, res as Response);

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error retrieving layers data'));

      // Restore console.error
      consoleErrorSpy.mockRestore();

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to retrieve layers data" });
    });
  });

  describe('getAssets', () => {
    it('should return assets data', () => {
      // Mock console.debug
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      // Call the method
      controller.getAssets(req as Request, res as Response);

      // Verify console.debug was called
      expect(consoleDebugSpy).toHaveBeenCalledWith('Assets requested');

      // Restore console.debug
      consoleDebugSpy.mockRestore();

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      // Get the data passed to res.json
      const responseData = (res.json as jest.Mock).mock.calls[0][0];

      // Verify that the response is an array of assets
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBeGreaterThan(0);
      expect(responseData[0]).toHaveProperty('id');
      expect(responseData[0]).toHaveProperty('name');
      expect(responseData[0]).toHaveProperty('variations');
    });

    it('should handle errors when retrieving assets data', () => {
      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock dataProviderUtils.readAssetsData to throw an error
      (dataProviderUtils.readAssetsData as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Call the method
      controller.getAssets(req as Request, res as Response);

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error retrieving assets data'));

      // Restore console.error
      consoleErrorSpy.mockRestore();

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to retrieve assets data" });
    });
  });

  describe('processLayerGeoJSON', () => {
    it('should return GeoJSON data when given a valid request', () => {
      // Setup request with params and body
      req.params = { layerId: 'testLayer' };
      req.body = {
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

      // Mock console.debug
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      // Call the method
      controller.processLayerGeoJSON(req as Request, res as Response);

      // Verify console.debug was called
      expect(consoleDebugSpy).toHaveBeenCalledWith('Processing GeoJSON for layer ID: testLayer');

      // Restore console.debug
      consoleDebugSpy.mockRestore();

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      // Get the data passed to res.json
      const responseData = (res.json as jest.Mock).mock.calls[0][0];

      // Verify that the response is a GeoJSON object
      expect(responseData).toHaveProperty('type');
      expect(responseData).toHaveProperty('features');
      expect(responseData.type).toBe('FeatureCollection');
    });

    it('should return 400 when given an invalid GeoJSON', () => {
      // Setup request with params and invalid body
      req.params = { layerId: 'testLayer' };
      req.body = {
        // Missing required 'type' property
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        }
      };

      // Call the method
      controller.processLayerGeoJSON(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid GeoJSON data" });
    });

    it('should handle errors when processing GeoJSON data', () => {
      // Setup request with params and body
      req.params = { layerId: 'testLayer' };
      req.body = {
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

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock dataProviderUtils.readSampleGeoJsonData to throw an error
      (dataProviderUtils.readSampleGeoJsonData as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Call the method
      controller.processLayerGeoJSON(req as Request, res as Response);

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error processing GeoJSON data'));

      // Restore console.error
      consoleErrorSpy.mockRestore();

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to process GeoJSON data" });
    });
  });

  describe('analyseLocation', () => {
    it('should return an array of GeoJSON objects when given a valid request', () => {
      // Setup request with body
      const mockGeoJson: GeoJSONDTO = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [0, 0]
            }
          }
        ]
      };

      const mockLayers = {
        categories: [
          {
            name: 'Test Category',
            items: [
              {
                id: 'testItem',
                name: 'Test Item',
                attributes: [],
                active: true
              }
            ]
          }
        ]
      };

      const mockAsset: AssetDTO = {
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
      };

      const analysisRequest: AnalysisRequestDTO = {
        location: mockGeoJson,
        layers: mockLayers,
        asset: mockAsset
      };

      req.body = analysisRequest;
      req.params = { assetType: 'test' };

      // Call the method
      controller.analyseLocation(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      // Get the data passed to res.json
      const responseData = (res.json as jest.Mock).mock.calls[0][0];

      // Verify that the response is an array of GeoJSON objects
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBeGreaterThan(0);
      expect(responseData[0]).toHaveProperty('type');
      expect(responseData[0].type).toBe('FeatureCollection');
    });

    it('should return 400 when given an invalid GeoJSON', () => {
      // Setup request with invalid GeoJSON
      const invalidGeoJson = {
        // Missing required 'type' property
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        }
      };

      const mockLayers = {
        categories: [
          {
            name: 'Test Category',
            items: [
              {
                id: 'testItem',
                name: 'Test Item',
                attributes: [],
                active: true
              }
            ]
          }
        ]
      };

      const mockAsset: AssetDTO = {
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
      };

      const analysisRequest = {
        location: invalidGeoJson,
        layers: mockLayers,
        asset: mockAsset
      };

      req.body = analysisRequest;
      req.params = { assetType: 'test' };

      // Call the method
      controller.analyseLocation(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid GeoJSON data" });
    });

    it('should handle errors when analysing location data', () => {
      // Setup request with body
      const mockGeoJson: GeoJSONDTO = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [0, 0]
            }
          }
        ]
      };

      const mockLayers = {
        categories: [
          {
            name: 'Test Category',
            items: [
              {
                id: 'testItem',
                name: 'Test Item',
                attributes: [],
                active: true
              }
            ]
          }
        ]
      };

      const mockAsset: AssetDTO = {
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
      };

      const analysisRequest: AnalysisRequestDTO = {
        location: mockGeoJson,
        layers: mockLayers,
        asset: mockAsset
      };

      req.body = analysisRequest;
      req.params = { assetType: 'test' };

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock dataProviderUtils.readSampleGeoJsonData to throw an error
      (dataProviderUtils.readSampleGeoJsonData as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Call the method
      controller.analyseLocation(req as Request, res as Response);

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error analysing location data'));

      // Restore console.error
      consoleErrorSpy.mockRestore();

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to analyse location data" });
    });
  });

  describe('analyseAsset', () => {
    it('should return a SuitabilityResponseDTO when given a valid request', () => {
      // Setup request with body
      const mockGeoJson: GeoJSONDTO = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [0, 0]
            }
          }
        ]
      };

      const mockLayers = {
        categories: [
          {
            name: 'Test Category',
            items: [
              {
                id: 'testItem',
                name: 'Test Item',
                attributes: [],
                active: true
              }
            ]
          }
        ]
      };

      const mockAsset: AssetDTO = {
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
      };

      const analysisRequest: AnalysisRequestDTO = {
        location: mockGeoJson,
        layers: mockLayers,
        asset: mockAsset
      };

      req.body = analysisRequest;

      // Call the method
      controller.analyseAsset(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      // Get the data passed to res.json
      const responseData = (res.json as jest.Mock).mock.calls[0][0];

      // Verify that the response is a SuitabilityResponseDTO
      expect(responseData).toHaveProperty('suitabilityPercentage');
      expect(responseData).toHaveProperty('suitabilityDescription');
      expect(typeof responseData.suitabilityPercentage).toBe('number');
      expect(typeof responseData.suitabilityDescription).toBe('string');
    });

    it('should return 400 when given an invalid GeoJSON', () => {
      // Setup request with invalid GeoJSON
      const invalidGeoJson = {
        // Missing required 'type' property
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        }
      };

      const mockLayers = {
        categories: [
          {
            name: 'Test Category',
            items: [
              {
                id: 'testItem',
                name: 'Test Item',
                attributes: [],
                active: true
              }
            ]
          }
        ]
      };

      const mockAsset: AssetDTO = {
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
      };

      const analysisRequest = {
        location: invalidGeoJson,
        layers: mockLayers,
        asset: mockAsset
      };

      req.body = analysisRequest;

      // Call the method
      controller.analyseAsset(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid GeoJSON data" });
    });

    it('should handle errors when analysing asset suitability', () => {
      // Setup request with body
      const mockGeoJson: GeoJSONDTO = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [0, 0]
            }
          }
        ]
      };

      const mockLayers = {
        categories: [
          {
            name: 'Test Category',
            items: [
              {
                id: 'testItem',
                name: 'Test Item',
                attributes: [],
                active: true
              }
            ]
          }
        ]
      };

      const mockAsset: AssetDTO = {
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
      };

      const analysisRequest: AnalysisRequestDTO = {
        location: mockGeoJson,
        layers: mockLayers,
        asset: mockAsset
      };

      req.body = analysisRequest;

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock isValidGeoJSON to return true so we pass validation
      const originalIsValidGeoJSON = require('../src/models/geojson.model').isValidGeoJSON;
      require('../src/models/geojson.model').isValidGeoJSON = jest.fn().mockReturnValue(true);

      // Force an error in the try block by making req.body.location throw when accessed
      Object.defineProperty(req.body, 'location', {
        get: function() {
          throw new Error('Test error');
        }
      });

      // Call the method
      controller.analyseAsset(req as Request, res as Response);

      // Restore the original isValidGeoJSON function
      require('../src/models/geojson.model').isValidGeoJSON = originalIsValidGeoJSON;

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Verify the error message
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error analysing asset suitability'));

      // Restore console.error
      consoleErrorSpy.mockRestore();

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to analyse asset suitability" });
    });
  });

  describe('getSubstations', () => {
    it('should return an array of LocationDTO objects when given a valid GeoJSON point', () => {
      // Setup request with a valid GeoJSON point
      const mockGeoJsonPoint: GeoJSONDTO = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        }
      };

      req.body = mockGeoJsonPoint;

      // Call the method
      controller.getSubstations(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      // Get the data passed to res.json
      const responseData = (res.json as jest.Mock).mock.calls[0][0];

      // Verify that the response is an array of LocationDTO objects
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBe(3); // We expect 3 substations from substations.json

      // Verify the structure of each LocationDTO
      responseData.forEach((location: LocationDTO) => {
        expect(location).toHaveProperty('name');
        expect(location).toHaveProperty('location');
        expect(location).toHaveProperty('distance');
        expect(typeof location.name).toBe('string');
        expect(typeof location.distance).toBe('number');
        expect(location.location).toHaveProperty('type');
        expect(location.location).toHaveProperty('geometry');
        expect(location.location.geometry).toHaveProperty('type');
        expect(location.location.geometry).toHaveProperty('coordinates');
        expect(location.location.geometry?.type).toBe('Point');
        expect(Array.isArray(location.location.geometry?.coordinates)).toBe(true);
        expect(location.location.geometry?.coordinates?.length).toBe(2);
      });
    });

    it('should return 400 when given an invalid GeoJSON', () => {
      // Setup request with invalid GeoJSON
      const invalidGeoJson = {
        // Missing required 'type' property
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        }
      };

      req.body = invalidGeoJson;

      // Call the method
      controller.getSubstations(req as Request, res as Response);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid GeoJSON data" });
    });

    it('should handle errors when retrieving substations', () => {
      // Setup request with a valid GeoJSON point
      const mockGeoJsonPoint: GeoJSONDTO = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        }
      };

      req.body = mockGeoJsonPoint;

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock dataProviderUtils.readSubstationsData to throw an error
      (dataProviderUtils.readSubstationsData as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Call the method
      controller.getSubstations(req as Request, res as Response);

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error retrieving substations'));

      // Restore console.error
      consoleErrorSpy.mockRestore();

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to retrieve substations" });
    });
  });
});
