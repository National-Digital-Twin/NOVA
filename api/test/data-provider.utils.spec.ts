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

    const mockWindspeedGoodLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
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
        ],
    };

    const mockWindspeedBadLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
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

    const mockSpecialAreasOfConservation2KmLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.2846072279981229, 50.71519249535743],
                            [-1.2846072279981229, 50.70037458785512],
                            [-1.2536965621014815, 50.70037458785512],
                            [-1.2536965621014815, 50.71519249535743],
                            [-1.2846072279981229, 50.71519249535743],
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

    const mockSitesOfSpecialScientificInterest2KmLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.3448236211275173, 50.71459877389401],
                            [-1.3448236211275173, 50.70264161030374],
                            [-1.3197472499953449, 50.70264161030374],
                            [-1.3197472499953449, 50.71459877389401],
                            [-1.3448236211275173, 50.71459877389401],
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

    const mockAreasOfNaturalBeauty2KmLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.3435141171325995, 50.69272286828951],
                            [-1.3435141171325995, 50.68002596642458],
                            [-1.3226502245397285, 50.68002596642458],
                            [-1.3226502245397285, 50.69272286828951],
                            [-1.3435141171325995, 50.69272286828951],
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

    const mockBuiltupAreas2KmLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.3158927157848268, 50.70543644051841],
                            [-1.3158927157848268, 50.695162844379155],
                            [-1.2928806637628156, 50.695162844379155],
                            [-1.2928806637628156, 50.70543644051841],
                            [-1.3158927157848268, 50.70543644051841],
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

    describe('getWindspeedGoodLayerData', () => {
        it('should read and parse the windspeed good layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockWindspeedGoodLayerData));

            // Call the method
            const result = dataProviderUtils.getWindspeedGoodLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('windspeed-good.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockWindspeedGoodLayerData);
        });
    });

    describe('getWindspeedBadLayerData', () => {
        it('should read and parse the windspeed bad layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockWindspeedBadLayerData));

            // Call the method
            const result = dataProviderUtils.getWindspeedBadLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('windspeed-bad.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockWindspeedBadLayerData);
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

    describe('getSpecialAreasOfConservation2KmLayerData', () => {
        it('should read and parse the special areas of conservation 2km layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSpecialAreasOfConservation2KmLayerData));

            // Call the method
            const result = dataProviderUtils.getSpecialAreasOfConservation2KmLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('sac-2km.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockSpecialAreasOfConservation2KmLayerData);
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

    describe('getSiteOfSpecialScientificInterest2KmLayerData', () => {
        it('should read and parse the sites of special scientific interest layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSitesOfSpecialScientificInterest2KmLayerData));

            // Call the method
            const result = dataProviderUtils.getSitesOfSpecialScientificInterest2KmLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('sssi-2km.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockSitesOfSpecialScientificInterest2KmLayerData);
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

    describe('getAreasOfNaturalBeauty2KmLayerData', () => {
        it('should read and parse the areas of natural beauty layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockAreasOfNaturalBeauty2KmLayerData));

            // Call the method
            const result = dataProviderUtils.getAreasOfNaturalBeauty2KmLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('areanb-2km.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockAreasOfNaturalBeauty2KmLayerData);
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

    describe('getBuiltupAreas2KmLayerData', () => {
        it('should read and parse the built up areas 2km layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockBuiltupAreas2KmLayerData));

            // Call the method
            const result = dataProviderUtils.getBuiltupAreas2KmLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('bua-2km.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockBuiltupAreas2KmLayerData);
        });
    });
});
