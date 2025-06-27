import * as fs from 'fs';
import { AssetsDTO } from '../src/models/asset.model';
import { LayersDTO } from '../src/models/layers.model';
import { LocationsDTO } from '../src/models/location.model';
import { dataProviderUtils } from '../src/utils/data-provider.utils';
import { Feature } from 'geojson';

// Mock fs module
jest.mock('fs');

describe('DataProviderUtils', () => {
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
                    },
                    {
                        id: 'testItem2',
                        name: 'Test Item 2',
                        attributes: [],
                        // active property intentionally omitted to test default value assignment
                    },
                ],
            },
        ],
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
                            displayName: 'Test Specification',
                        },
                    ],
                },
            ],
        },
    ];

    const mockSubstationsData: LocationsDTO = [
        {
            name: 'Test Substation',
            location: {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0],
                },
                properties: {},
            } as Feature,
            distance: 1.5,
        },
    ];

    const mockWindspeedLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {
                    ws_spring1: 4.5,
                },
                geometry: {
                    coordinates: [
                        [
                            [-1.3353644688831992, 50.70823856465367],
                            [-1.3353644688831992, 50.685261264837806],
                            [-1.2646063737671227, 50.685261264837806],
                            [-1.2646063737671227, 50.70823856465367],
                            [-1.3353644688831992, 50.70823856465367],
                        ],
                    ],
                    type: 'Polygon',
                },
            },
            {
                type: 'Feature',
                properties: {
                    ws_spring1: 8,
                },
                geometry: {
                    coordinates: [
                        [
                            [-1.3011395290153018, 50.69104609243263],
                            [-1.3011395290153018, 50.66841263464531],
                            [-1.2418094343717598, 50.66841263464531],
                            [-1.2418094343717598, 50.69104609243263],
                            [-1.3011395290153018, 50.69104609243263],
                        ],
                    ],
                    type: 'Polygon',
                },
            },
        ],
    };

    const mockSpecialAreasOfConvservationLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.281658414106687, 50.71330487610129],
                            [-1.281658414106687, 50.70186733241772],
                            [-1.2563473429851797, 50.70186733241772],
                            [-1.2563473429851797, 50.71330487610129],
                            [-1.281658414106687, 50.71330487610129],
                        ],
                    ],
                    type: 'Polygon',
                },
            },
        ],
    };

    const mockSitesOfSpecialScientificInterestLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.343346457616093, 50.713289971134486],
                            [-1.343346457616093, 50.70376040412796],
                            [-1.3215116161465517, 50.70376040412796],
                            [-1.3215116161465517, 50.713289971134486],
                            [-1.343346457616093, 50.713289971134486],
                        ],
                    ],
                    type: 'Polygon',
                },
            },
        ],
    };

    const mockAreasOfNaturalBeautyLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.3419963357412428, 50.691229841834996],
                            [-1.3419963357412428, 50.68114467040985],
                            [-1.3241316461090378, 50.68114467040985],
                            [-1.3241316461090378, 50.691229841834996],
                            [-1.3419963357412428, 50.691229841834996],
                        ],
                    ],
                    type: 'Polygon',
                },
            },
        ],
    };

    const mockBuiltupAreasLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.314421032212266, 50.70469119871362],
                            [-1.314421032212266, 50.69591132166596],
                            [-1.2943574317247055, 50.69591132166596],
                            [-1.2943574317247055, 50.70469119871362],
                            [-1.314421032212266, 50.70469119871362],
                        ],
                    ],
                    type: 'Polygon',
                },
            },
        ],
    };

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

            // Verify the result
            expect(result).toEqual(mockData);
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

    describe('getWindspeedLayerData', () => {
        it('should read and parse the windspeed layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockWindspeedLayerData));

            // Call the method
            const result = dataProviderUtils.getWindspeedLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('windspeed.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockWindspeedLayerData);
        });
    });

    describe('getSpecialAreasOfConservationLayerData', () => {
        it('should read and parse the special areas of conservation layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSpecialAreasOfConvservationLayerData));

            // Call the method
            const result = dataProviderUtils.getSpecialAreasOfConservationLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('sac.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockSpecialAreasOfConvservationLayerData);
        });
    });

    describe('getSiteOfSpecialScientificInterestLayerData', () => {
        it('should read and parse the sites of special scientific interest layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSitesOfSpecialScientificInterestLayerData));

            // Call the method
            const result = dataProviderUtils.getSitesOfSpecialScientificInterestLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('sssi.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockSitesOfSpecialScientificInterestLayerData);
        });
    });

    describe('getAreasOfNaturalBeautyLayerData', () => {
        it('should read and parse the areas of natural beauty layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockAreasOfNaturalBeautyLayerData));

            // Call the method
            const result = dataProviderUtils.getAreasOfNaturalBeautyLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('areanb.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockAreasOfNaturalBeautyLayerData);
        });
    });

    describe('getBuiltupAreasLayerData', () => {
        it('should read and parse the built up areas layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockBuiltupAreasLayerData));

            // Call the method
            const result = dataProviderUtils.getBuiltupAreasLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('bua.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockBuiltupAreasLayerData);
        });
    });
});
