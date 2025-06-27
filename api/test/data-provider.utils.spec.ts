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

    const mockSpecialAreasOfConservationLayerData = {
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

    const mockSpecialAreasOfConservationBufferedLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [-1.2987515933705105, 50.70758231916396],
                            [-1.2986071791972071, 50.7057357892586],
                            [-1.2981776931430613, 50.70390711411757],
                            [-1.2974673036660942, 50.70211390177117],
                            [-1.2964828819362129, 50.700373416790185],
                            [-1.295233934520892, 50.698702414212896],
                            [-1.2937325108324376, 50.69711697844578],
                            [-1.2919930862664162, 50.695632368679625],
                            [-1.2900324221880082, 50.69426287229712],
                            [-1.287869404137873, 50.693021667670216],
                            [-1.2855248598298612, 50.691920697653316],
                            [-1.2830213586979928, 50.6909705549749],
                            [-1.2803829949181118, 50.69018038061593],
                            [-1.2776351559792514, 50.68955777613828],
                            [-1.2757094949156569, 50.68925231986295],
                            [-1.27519545839354, 50.71590803611056],
                            [-1.295658707685225, 50.71590803611056],
                            [-1.2964913346687237, 50.71479233016628],
                            [-1.2974739449352346, 50.713051374460214],
                            [-1.2981822677287183, 50.71125781233352],
                            [-1.2986095113007228, 50.70942892179886],
                            [-1.2987515933705105, 50.70758231916396],
                        ],
                    ],
                },
            },
        ],
    };

    const mockSpecialAreasOfConservationBuffered1_5KmLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [-1.3058521053154952, 50.70758029665277],
                            [-1.3056728772379862, 50.70529304228955],
                            [-1.3051405488116887, 50.70302792540121],
                            [-1.3042602961606604, 50.70080675552486],
                            [-1.3030406422059784, 50.698650915998044],
                            [-1.3014933728352642, 50.696581158323696],
                            [-1.2996334218660228, 50.69461740272245],
                            [-1.2974787259692626, 50.692778546777326],
                            [-1.2950500509984886, 50.691082283995264],
                            [-1.2923707914320768, 50.689544934011266],
                            [-1.2894667448821406, 50.688181286047346],
                            [-1.2863658638485238, 50.68700445710977],
                            [-1.2830979871008095, 50.686025766266454],
                            [-1.2796945532528958, 50.685254626192005],
                            [-1.2761882992525042, 50.68469845300389],
                            [-1.2757980199917305, 50.684661791355566],
                            [-1.27519545839354, 50.71590803611056],
                            [-1.3033940570469884, 50.71590803611056],
                            [-1.3042704860955638, 50.714354816538496],
                            [-1.3051475677607136, 50.71213310998187],
                            [-1.3056764554671016, 50.709867662607465],
                            [-1.3058521053154952, 50.70758029665277],
                        ],
                    ],
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
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSpecialAreasOfConservationLayerData));

            // Call the method
            const result = dataProviderUtils.getSpecialAreasOfConservationLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('sac.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockSpecialAreasOfConservationLayerData);
        });
    });

    describe('getSpecialAreasOfConservationBufferedLayerData', () => {
        it('should read and parse the special areas of conservation buffered layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSpecialAreasOfConservationBufferedLayerData));

            // Call the method
            const result = dataProviderUtils.getSpecialAreasOfConservationBufferedLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('sac-1km.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockSpecialAreasOfConservationBufferedLayerData);
        });
    });

    describe('getSpecialAreasOfConservationBuffered1_5LayerData', () => {
        it('should read and parse the special areas of conservation buffered 1_5 km layer data from file', () => {
            // Mock fs.readFileSync to return our mock data
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockSpecialAreasOfConservationBuffered1_5KmLayerData));

            // Call the method
            const result = dataProviderUtils.getSpecialAreasOfConservationBuffered1_5KmLayerData();

            // Verify fs.readFileSync was called with the correct path
            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('sac-1_5km.geojson'), 'utf8');

            // Verify the result
            expect(result).toEqual(mockSpecialAreasOfConservationBuffered1_5KmLayerData);
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
