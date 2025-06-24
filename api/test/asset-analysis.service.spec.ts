import { AssetAnalysisService } from '../src/services/asset-analysis.service';
import { dataProviderUtils } from '../src/utils/data-provider.utils';
import { FeatureCollection, Polygon, GeoJsonProperties, Geometry } from 'geojson';
import { DataLayerDto } from '../src/models/data-layer.model';
import { AssetLocationRequestDto } from '../src/models/asset-location-request.model';

// Mock dataProviderUtils
jest.mock('../src/utils/data-provider.utils');

describe('analyzeLocation', () => {
    let assetAnalysisService: AssetAnalysisService;

    const mockWindspeedGoodLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [
                                [-1.3353644688831992, 50.70823856465367],
                                [-1.3353644688831992, 50.685261264837806],
                                [-1.2646063737671227, 50.685261264837806],
                                [-1.2646063737671227, 50.70823856465367],
                                [-1.3353644688831992, 50.70823856465367],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
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
                            [
                                [-1.3011395290153018, 50.69104609243263],
                                [-1.3011395290153018, 50.66841263464531],
                                [-1.2418094343717598, 50.66841263464531],
                                [-1.2418094343717598, 50.69104609243263],
                                [-1.3011395290153018, 50.69104609243263],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
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
                            [
                                [-1.281658414106687, 50.71330487610129],
                                [-1.281658414106687, 50.70186733241772],
                                [-1.2563473429851797, 50.70186733241772],
                                [-1.2563473429851797, 50.71330487610129],
                                [-1.281658414106687, 50.71330487610129],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
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
                            [
                                [-1.2846072279981229, 50.71519249535743],
                                [-1.2846072279981229, 50.70037458785512],
                                [-1.2536965621014815, 50.70037458785512],
                                [-1.2536965621014815, 50.71519249535743],
                                [-1.2846072279981229, 50.71519249535743],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
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
                            [
                                [-1.343346457616093, 50.713289971134486],
                                [-1.343346457616093, 50.70376040412796],
                                [-1.3215116161465517, 50.70376040412796],
                                [-1.3215116161465517, 50.713289971134486],
                                [-1.343346457616093, 50.713289971134486],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
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
                            [
                                [-1.3448236211275173, 50.71459877389401],
                                [-1.3448236211275173, 50.70264161030374],
                                [-1.3197472499953449, 50.70264161030374],
                                [-1.3197472499953449, 50.71459877389401],
                                [-1.3448236211275173, 50.71459877389401],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
                },
            },
        ],
    };

    const mockAreasOfOutstandingNaturalBeautyLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [
                                [-1.3419963357412428, 50.691229841834996],
                                [-1.3419963357412428, 50.68114467040985],
                                [-1.3241316461090378, 50.68114467040985],
                                [-1.3241316461090378, 50.691229841834996],
                                [-1.3419963357412428, 50.691229841834996],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
                },
            },
        ],
    };

    const mockAreasOfOutstandingNaturalBeauty2KmLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [
                                [-1.3435141171325995, 50.69272286828951],
                                [-1.3435141171325995, 50.68002596642458],
                                [-1.3226502245397285, 50.68002596642458],
                                [-1.3226502245397285, 50.69272286828951],
                                [-1.3435141171325995, 50.69272286828951],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
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
                            [
                                [-1.314421032212266, 50.70469119871362],
                                [-1.314421032212266, 50.69591132166596],
                                [-1.2943574317247055, 50.69591132166596],
                                [-1.2943574317247055, 50.70469119871362],
                                [-1.314421032212266, 50.70469119871362],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
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
                            [
                                [-1.3158927157848268, 50.70543644051841],
                                [-1.3158927157848268, 50.695162844379155],
                                [-1.2928806637628156, 50.695162844379155],
                                [-1.2928806637628156, 50.70543644051841],
                                [-1.3158927157848268, 50.70543644051841],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
                },
            },
        ],
    };

    const drawnLocation: FeatureCollection<Polygon> = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    coordinates: [
                        [
                            [-1.3465969302374958, 50.71590803611056],
                            [-1.3465969302374958, 50.68805808728612],
                            [-1.27519545839354, 50.68805808728612],
                            [-1.27519545839354, 50.71590803611056],
                            [-1.3465969302374958, 50.71590803611056],
                        ],
                    ],
                    type: 'Polygon',
                },
            },
        ],
    };

    const dataLayers: DataLayerDto[] = [
        {
            id: 'windSpeed',
            attributes: [],
            analyze: true,
        },
        {
            id: 'specialAreasOfConservation',
            attributes: [],
            analyze: true,
        },
        {
            id: 'sitesOfSpecialScientificInterest',
            attributes: [],
            analyze: true,
        },
        {
            id: 'builtUpAreas',
            attributes: [],
            analyze: true,
        },
        {
            id: 'areasOfOutstandingNaturalBeauty',
            attributes: [],
            analyze: true,
        },
    ];

    beforeEach(() => {
        jest.resetAllMocks();

        assetAnalysisService = new AssetAnalysisService(dataProviderUtils);

        (dataProviderUtils.getWindspeedGoodLayerData as jest.Mock).mockImplementation(() => mockWindspeedGoodLayerData);
        (dataProviderUtils.getWindspeedBadLayerData as jest.Mock).mockImplementation(() => mockWindspeedBadLayerData);
        (dataProviderUtils.getSpecialAreasOfConservationLayerData as jest.Mock).mockImplementation(() => mockSpecialAreasOfConvservationLayerData);
        (dataProviderUtils.getSpecialAreasOfConservation2KmLayerData as jest.Mock).mockImplementation(() => mockSpecialAreasOfConservation2KmLayerData);
        (dataProviderUtils.getSitesOfSpecialScientificInterestLayerData as jest.Mock).mockImplementation(() => mockSitesOfSpecialScientificInterestLayerData);
        (dataProviderUtils.getSitesOfSpecialScientificInterest2KmLayerData as jest.Mock).mockImplementation(
            () => mockSitesOfSpecialScientificInterest2KmLayerData
        );
        (dataProviderUtils.getBuiltupAreasLayerData as jest.Mock).mockImplementation(() => mockBuiltupAreasLayerData);
        (dataProviderUtils.getBuiltupAreas2KmLayerData as jest.Mock).mockImplementation(() => mockBuiltupAreas2KmLayerData);
        (dataProviderUtils.getAreasOfNaturalBeautyLayerData as jest.Mock).mockImplementation(() => mockAreasOfOutstandingNaturalBeautyLayerData);
        (dataProviderUtils.getAreasOfNaturalBeauty2KmLayerData as jest.Mock).mockImplementation(() => mockAreasOfOutstandingNaturalBeauty2KmLayerData);
    });

    it('returns an empty feature collection when no data layers are provided for analysis', () => {
        const noDataLayersToAnalyze = dataLayers.map((dataLayer) => {
            const mappedDataLayer = { ...dataLayer, analyze: false };
            return mappedDataLayer;
        });
        const requestDto: AssetLocationRequestDto = {
            location: drawnLocation,
            dataLayers: noDataLayersToAnalyze,
        };

        const result: FeatureCollection<Geometry, GeoJsonProperties> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result.features).toEqual([]);
    });

    it('returns an empty feature collection when no matched polygons are found for the provided location', () => {
        const drawnLocationForNoMatches: FeatureCollection<Polygon> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        coordinates: [
                            [
                                [-1.3965928986904714, 50.67335560403771],
                                [-1.3965928986904714, 50.66525754664215],
                                [-1.3677945231333126, 50.66525754664215],
                                [-1.3677945231333126, 50.67335560403771],
                                [-1.3965928986904714, 50.67335560403771],
                            ],
                        ],
                        type: 'Polygon',
                    },
                },
            ],
        };

        const requestDto: AssetLocationRequestDto = {
            location: drawnLocationForNoMatches,
            dataLayers,
        };

        const result: FeatureCollection<Geometry, GeoJsonProperties> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result.features).toEqual([]);
    });

    it('returns the windspeed bad and good matched polygons when only the windspeed data layer is set to analyze', () => {
        const dataLayersWindspeedOnly = dataLayers.map((dataLayer) => {
            const mappedDataLayer = { ...dataLayer };
            if (mappedDataLayer.id !== 'windSpeed') {
                mappedDataLayer.analyze = false;
            }
            return mappedDataLayer;
        });

        const requestDto: AssetLocationRequestDto = {
            location: drawnLocation,
            dataLayers: dataLayersWindspeedOnly,
        };

        const expectedResult: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'green',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3353644688831992, 50.68805808728612],
                                [-1.27519545839354, 50.68805808728612],
                                [-1.27519545839354, 50.70823856465367],
                                [-1.3353644688831992, 50.70823856465367],
                                [-1.3353644688831992, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Bad windspeed - < 4m/s',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3011395290153018, 50.68805808728612],
                                [-1.27519545839354, 50.68805808728612],
                                [-1.27519545839354, 50.69104609243263],
                                [-1.3011395290153018, 50.69104609243263],
                                [-1.3011395290153018, 50.68805808728612],
                            ],
                        ],
                    },
                },
            ],
        };

        const result: FeatureCollection<Geometry> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result).toEqual(expectedResult);
    });

    it('returns the special areas of conservation matched polygons when only the special areas of conservation data layer is set to analyze', () => {
        const dataLayersSpecialAreasOfConservationOnly = dataLayers.map((dataLayer) => {
            const mappedDataLayer = { ...dataLayer };
            if (mappedDataLayer.id !== 'specialAreasOfConservation') {
                mappedDataLayer.analyze = false;
            }
            return mappedDataLayer;
        });

        const requestDto: AssetLocationRequestDto = {
            location: drawnLocation,
            dataLayers: dataLayersSpecialAreasOfConservationOnly,
        };

        const expectedResult: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to special areas of conservation - < 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.281658414106687, 50.70186733241772],
                                [-1.27519545839354, 50.70186733241772],
                                [-1.27519545839354, 50.71330487610129],
                                [-1.281658414106687, 50.71330487610129],
                                [-1.281658414106687, 50.70186733241772],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to special areas of conservation - <= 2km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.2846072279981229, 50.70037458785512],
                                [-1.27519545839354, 50.70037458785512],
                                [-1.27519545839354, 50.71519249535743],
                                [-1.2846072279981229, 50.71519249535743],
                                [-1.2846072279981229, 50.70037458785512],
                            ],
                        ],
                    },
                },
            ],
        };

        const result: FeatureCollection<Geometry> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result).toEqual(expectedResult);
    });

    it('returns the sites of special scientific interest matched polygons when only the sites of special scientific interest data layer is set to analyze', () => {
        const dataLayersSitesOfSpecialScientificInterestOnly = dataLayers.map((dataLayer) => {
            const mappedDataLayer = { ...dataLayer };
            if (mappedDataLayer.id !== 'sitesOfSpecialScientificInterest') {
                mappedDataLayer.analyze = false;
            }
            return mappedDataLayer;
        });

        const requestDto: AssetLocationRequestDto = {
            location: drawnLocation,
            dataLayers: dataLayersSitesOfSpecialScientificInterestOnly,
        };

        const expectedResult: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to sites of special scientific interest - < 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.343346457616093, 50.70376040412796],
                                [-1.3215116161465517, 50.70376040412796],
                                [-1.3215116161465517, 50.713289971134486],
                                [-1.343346457616093, 50.713289971134486],
                                [-1.343346457616093, 50.70376040412796],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to sites of special scientific interest - <= 2km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3448236211275173, 50.70264161030374],
                                [-1.3197472499953449, 50.70264161030374],
                                [-1.3197472499953449, 50.71459877389401],
                                [-1.3448236211275173, 50.71459877389401],
                                [-1.3448236211275173, 50.70264161030374],
                            ],
                        ],
                    },
                },
            ],
        };

        const result: FeatureCollection<Geometry> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result).toEqual(expectedResult);
    });

    it('returns the built up areas matched polygons when only the built up areas data layer is set to analyze', () => {
        const dataLayersBuiltupAreasOnly = dataLayers.map((dataLayer) => {
            const mappedDataLayer = { ...dataLayer };
            if (mappedDataLayer.id !== 'builtUpAreas') {
                mappedDataLayer.analyze = false;
            }
            return mappedDataLayer;
        });

        const requestDto: AssetLocationRequestDto = {
            location: drawnLocation,
            dataLayers: dataLayersBuiltupAreasOnly,
        };

        const expectedResult: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to built up areas - < 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.314421032212266, 50.69591132166596],
                                [-1.2943574317247055, 50.69591132166596],
                                [-1.2943574317247055, 50.70469119871362],
                                [-1.314421032212266, 50.70469119871362],
                                [-1.314421032212266, 50.69591132166596],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to built up areas - <= 2km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3158927157848268, 50.695162844379155],
                                [-1.2928806637628156, 50.695162844379155],
                                [-1.2928806637628156, 50.70543644051841],
                                [-1.3158927157848268, 50.70543644051841],
                                [-1.3158927157848268, 50.695162844379155],
                            ],
                        ],
                    },
                },
            ],
        };

        const result: FeatureCollection<Geometry> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result).toEqual(expectedResult);
    });

    it('returns the areas of outstanding natural beauty matched polygons when only the areas of outstanding natural beauty data layer is set to analyze', () => {
        const dataLayersAreasOfOutstandingNaturalBeauty = dataLayers.map((dataLayer) => {
            const mappedDataLayer = { ...dataLayer };
            if (mappedDataLayer.id !== 'areasOfOutstandingNaturalBeauty') {
                mappedDataLayer.analyze = false;
            }
            return mappedDataLayer;
        });

        const requestDto: AssetLocationRequestDto = {
            location: drawnLocation,
            dataLayers: dataLayersAreasOfOutstandingNaturalBeauty,
        };

        const expectedResult: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to areas of outstanding natural beauty - < 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3419963357412428, 50.68805808728612],
                                [-1.3241316461090378, 50.68805808728612],
                                [-1.3241316461090378, 50.691229841834996],
                                [-1.3419963357412428, 50.691229841834996],
                                [-1.3419963357412428, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to areas of outstanding natural beauty - <= 2km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3435141171325995, 50.68805808728612],
                                [-1.3226502245397285, 50.68805808728612],
                                [-1.3226502245397285, 50.69272286828951],
                                [-1.3435141171325995, 50.69272286828951],
                                [-1.3435141171325995, 50.68805808728612],
                            ],
                        ],
                    },
                },
            ],
        };

        const result: FeatureCollection<Geometry> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result).toEqual(expectedResult);
    });

    it('returns all the matched polygons when all the data layers are set to analyze', () => {
        const requestDto: AssetLocationRequestDto = {
            location: drawnLocation,
            dataLayers,
        };

        const expectedResult: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'green',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3353644688831992, 50.68805808728612],
                                [-1.27519545839354, 50.68805808728612],
                                [-1.27519545839354, 50.70823856465367],
                                [-1.3353644688831992, 50.70823856465367],
                                [-1.3353644688831992, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Bad windspeed - < 4m/s',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3011395290153018, 50.68805808728612],
                                [-1.27519545839354, 50.68805808728612],
                                [-1.27519545839354, 50.69104609243263],
                                [-1.3011395290153018, 50.69104609243263],
                                [-1.3011395290153018, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to special areas of conservation - < 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.281658414106687, 50.70186733241772],
                                [-1.27519545839354, 50.70186733241772],
                                [-1.27519545839354, 50.71330487610129],
                                [-1.281658414106687, 50.71330487610129],
                                [-1.281658414106687, 50.70186733241772],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to special areas of conservation - <= 2km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.2846072279981229, 50.70037458785512],
                                [-1.27519545839354, 50.70037458785512],
                                [-1.27519545839354, 50.71519249535743],
                                [-1.2846072279981229, 50.71519249535743],
                                [-1.2846072279981229, 50.70037458785512],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to sites of special scientific interest - < 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.343346457616093, 50.70376040412796],
                                [-1.3215116161465517, 50.70376040412796],
                                [-1.3215116161465517, 50.713289971134486],
                                [-1.343346457616093, 50.713289971134486],
                                [-1.343346457616093, 50.70376040412796],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to sites of special scientific interest - <= 2km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3448236211275173, 50.70264161030374],
                                [-1.3197472499953449, 50.70264161030374],
                                [-1.3197472499953449, 50.71459877389401],
                                [-1.3448236211275173, 50.71459877389401],
                                [-1.3448236211275173, 50.70264161030374],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to built up areas - < 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.314421032212266, 50.69591132166596],
                                [-1.2943574317247055, 50.69591132166596],
                                [-1.2943574317247055, 50.70469119871362],
                                [-1.314421032212266, 50.70469119871362],
                                [-1.314421032212266, 50.69591132166596],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to built up areas - <= 2km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3158927157848268, 50.695162844379155],
                                [-1.2928806637628156, 50.695162844379155],
                                [-1.2928806637628156, 50.70543644051841],
                                [-1.3158927157848268, 50.70543644051841],
                                [-1.3158927157848268, 50.695162844379155],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to areas of outstanding natural beauty - < 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3419963357412428, 50.68805808728612],
                                [-1.3241316461090378, 50.68805808728612],
                                [-1.3241316461090378, 50.691229841834996],
                                [-1.3419963357412428, 50.691229841834996],
                                [-1.3419963357412428, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to areas of outstanding natural beauty - <= 2km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3435141171325995, 50.68805808728612],
                                [-1.3226502245397285, 50.68805808728612],
                                [-1.3226502245397285, 50.69272286828951],
                                [-1.3435141171325995, 50.69272286828951],
                                [-1.3435141171325995, 50.68805808728612],
                            ],
                        ],
                    },
                },
            ],
        };

        const result: FeatureCollection<Geometry> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result).toEqual(expectedResult);
    });
});
