import { AssetAnalysisService } from '../src/services/asset-analysis.service';
import { dataProviderUtils } from '../src/utils/data-provider.utils';
import { FeatureCollection, Polygon, GeoJsonProperties, Geometry } from 'geojson';
import { DataLayerDto } from '../src/models/data-layer.model';
import { AssetLocationRequestDto } from '../src/models/asset-location-request.model';

// Mock dataProviderUtils
jest.mock('../src/utils/data-provider.utils');

describe('analyzeLocation', () => {
    let assetAnalysisService: AssetAnalysisService;

    const mockWindspeedLayerData = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { ws_spring1: 4.5 },
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
            {
                type: 'Feature',
                properties: { ws_spring1: 3.5 },
                geometry: {
                    coordinates: [
                        [
                            [
                                [-1.33461711915146, 50.685218148192405],
                                [-1.33461711915146, 50.66635806243448],
                                [-1.264591217818861, 50.66635806243448],
                                [-1.264591217818861, 50.685218148192405],
                                [-1.33461711915146, 50.685218148192405],
                            ],
                        ],
                    ],
                    type: 'MultiPolygon',
                },
            },
            {
                type: 'Feature',
                properties: { ws_spring1: 6.5 },
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
            {
                type: 'Feature',
                properties: { ws_spring1: 8.5 },
                geometry: {
                    coordinates: [
                        [
                            [
                                [-1.3010647701177902, 50.691902878625484],
                                [-1.2425384679944784, 50.691902878625484],
                                [-1.2425384679944784, 50.70709380802265],
                                [-1.3010647701177902, 50.70709380802265],
                                [-1.3010647701177902, 50.691902878625484],
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
                            [-1.3147572597099781, 50.67757048191068],
                            [-1.275870815939669, 50.680886907570596],
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
            attributes: [
                {
                    id: 'minSpeed',
                    value: 4,
                },
                {
                    id: 'maxSpeed',
                    value: 7.5,
                },
            ],
            analyze: true,
        },
        {
            id: 'specialAreasOfConservation',
            attributes: [
                {
                    id: 'minDistance',
                    value: 1,
                },
            ],
            analyze: true,
        },
        {
            id: 'sitesOfSpecialScientificInterest',
            attributes: [
                {
                    id: 'minDistance',
                    value: 1,
                },
            ],
            analyze: true,
        },
        {
            id: 'builtUpAreas',
            attributes: [
                {
                    id: 'minDistance',
                    value: 1,
                },
            ],
            analyze: true,
        },
        {
            id: 'areasOfOutstandingNaturalBeauty',
            attributes: [
                {
                    id: 'minDistance',
                    value: 1,
                },
            ],
            analyze: true,
        },
    ];

    beforeEach(() => {
        jest.resetAllMocks();

        assetAnalysisService = new AssetAnalysisService(dataProviderUtils);

        (dataProviderUtils.getWindspeedLayerData as jest.Mock).mockImplementation(() => mockWindspeedLayerData);
        (dataProviderUtils.getSpecialAreasOfConservationLayerData as jest.Mock).mockImplementation(() => mockSpecialAreasOfConvservationLayerData);
        (dataProviderUtils.getSpecialAreasOfConservationBufferedLayerData as jest.Mock).mockImplementation(
            () => mockSpecialAreasOfConservationBufferedLayerData
        );
        (dataProviderUtils.getSpecialAreasOfConservationBuffered1_5KmLayerData as jest.Mock).mockImplementation(
            () => mockSpecialAreasOfConservationBuffered1_5KmLayerData
        );
        (dataProviderUtils.getSitesOfSpecialScientificInterestLayerData as jest.Mock).mockImplementation(() => mockSitesOfSpecialScientificInterestLayerData);
        (dataProviderUtils.getBuiltupAreasLayerData as jest.Mock).mockImplementation(() => mockBuiltupAreasLayerData);
        (dataProviderUtils.getAreasOfNaturalBeautyLayerData as jest.Mock).mockImplementation(() => mockAreasOfOutstandingNaturalBeautyLayerData);
    });

    it('returns only the good layer when no data layers are provided for analysis', () => {
        const noDataLayersToAnalyze = dataLayers.map((dataLayer) => {
            const mappedDataLayer = { ...dataLayer, analyze: false };
            return mappedDataLayer;
        });
        const requestDto: AssetLocationRequestDto = {
            location: drawnLocation,
            dataLayers: noDataLayersToAnalyze,
        };

        const result: FeatureCollection<Geometry, GeoJsonProperties> = assetAnalysisService.analyzeLocation(requestDto);
        const expectedResult = {
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
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.27519545839354, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                            ],
                        ],
                    },
                },
            ],
        };

        expect(result).toEqual(expectedResult);
    });

    it('returns only the good layer when no other matched polygons are found for the provided location', () => {
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
        const expectedResult = {
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
                                [-1.3965928986904714, 50.67335560403771],
                                [-1.3965928986904714, 50.66525754664215],
                                [-1.3677945231333126, 50.66525754664215],
                                [-1.3677945231333126, 50.67335560403771],
                                [-1.3965928986904714, 50.67335560403771],
                            ],
                        ],
                    },
                },
            ],
        };

        const result: FeatureCollection<Geometry, GeoJsonProperties> = assetAnalysisService.analyzeLocation(requestDto);

        expect(result).toEqual(expectedResult);
    });

    it('returns the good layer and the windspeed bad matched polygons when only the windspeed data layer is set to analyze', () => {
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
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.27519545839354, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Bad windspeed - < 4m/s or > 7.5m/s',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.33461711915146, 50.68411208127974],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.2757872910459838, 50.685218148192405],
                                [-1.33461711915146, 50.685218148192405],
                                [-1.33461711915146, 50.68411208127974],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Bad windspeed - < 4m/s or > 7.5m/s',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3010647701177902, 50.691902878625484],
                                [-1.2756583807758117, 50.691902878625484],
                                [-1.2753654345108338, 50.70709380802265],
                                [-1.3010647701177902, 50.70709380802265],
                                [-1.3010647701177902, 50.691902878625484],
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
                        suitability: 'green',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.27519545839354, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to special areas of conservation - <= 1.5km',
                    },
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
                                [-1.2757980199917307, 50.684661791355566],
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
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to special areas of conservation - <= 1km',
                    },
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
                                [-1.275709494915657, 50.68925231986295],
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
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'darkRed',
                        issue: 'Too close to special areas of conservation - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.281658414106687, 50.70186733241772],
                                [-1.2754662233742031, 50.70186733241772],
                                [-1.2752456584821532, 50.71330487610129],
                                [-1.281658414106687, 50.71330487610129],
                                [-1.281658414106687, 50.70186733241772],
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
                        suitability: 'green',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.27519545839354, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to sites of special scientific interest - <= 1.5km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.68858760846721],
                                [-1.345649444838062, 50.688303851594256],
                                [-1.3424572282157277, 50.68758058030211],
                                [-1.3391685635334276, 50.68705893129631],
                                [-1.3358150823110972, 50.68674392155482],
                                [-1.332429036881322, 50.68663858061442],
                                [-1.3290429914515474, 50.68674392155482],
                                [-1.325689510229217, 50.68705893129631],
                                [-1.3224008455469167, 50.68758058030211],
                                [-1.3192086289245826, 50.688303851594256],
                                [-1.3161435679800908, 50.68922178880947],
                                [-1.3132351520481889, 50.69032556284243],
                                [-1.3105113692910695, 50.691604556447786],
                                [-1.3079984379824192, 50.69304646600275],
                                [-1.3057205545210924, 50.69463741946864],
                                [-1.3036996605814855, 50.696362109435846],
                                [-1.3019552316362013, 50.698203939991835],
                                [-1.300504088893849, 50.700145186019036],
                                [-1.2993602364821846, 50.70216716340867],
                                [-1.2985347254758313, 50.70425040857023],
                                [-1.2980355461202653, 50.70637486552424],
                                [-1.2978675493415825, 50.70852007878988],
                                [-1.2980323983569417, 50.71066539022045],
                                [-1.298528550915861, 50.71279013789677],
                                [-1.2993512724102554, 50.71487385516581],
                                [-1.2999348847565166, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68858760846721],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to sites of special scientific interest - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.69365359665675],
                                [-1.3453697514599399, 50.693187855845295],
                                [-1.3429342433580485, 50.692458445627594],
                                [-1.340397667985802, 50.69188371855912],
                                [-1.337784431741073, 50.69146920380709],
                                [-1.3351196761837814, 50.69121888908897],
                                [-1.332429036881322, 50.691135182433044],
                                [-1.329738397578863, 50.69121888908897],
                                [-1.3270736420215714, 50.69146920380709],
                                [-1.3244604057768425, 50.69188371855912],
                                [-1.321923830404596, 50.692458445627594],
                                [-1.3194883223027047, 50.693187855845295],
                                [-1.3171773185127338, 50.69406493162277],
                                [-1.3150130617087143, 50.69508123426185],
                                [-1.3130163865090505, 50.69622698491702],
                                [-1.3112065191494637, 50.6974911584369],
                                [-1.3096008924338296, 50.698861589194934],
                                [-1.3082149777407188, 50.700325087903195],
                                [-1.3070621357074803, 50.7018675682979],
                                [-1.3061534870419582, 50.70347418248928],
                                [-1.3054978047257635, 50.70512946368427],
                                [-1.305101428673952, 50.706817474917905],
                                [-1.3049682037055899, 50.708521962369446],
                                [-1.3050994414598696, 50.710226511793465],
                                [-1.3054939066650801, 50.71191470656298],
                                [-1.3061478279348846, 50.71357028580411],
                                [-1.3070549330302297, 50.715177301098095],
                                [-1.307600307748837, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.69365359665675],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'darkRed',
                        issue: 'Too close to sites of special scientific interest - <= 1km',
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
                        suitability: 'green',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.27519545839354, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to built up areas - <= 1.5km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.337881118133157, 50.700296462392096],
                                [-1.3377183678498128, 50.69821727259109],
                                [-1.3372346825225123, 50.69615819737058],
                                [-1.3364347612031973, 50.69413906280571],
                                [-1.33532634524651, 50.69217930787088],
                                [-1.333920142310406, 50.69029779747811],
                                [-1.332229721969586, 50.68851264112838],
                                [-1.330271383995494, 50.68684101891],
                                [-1.328064000611042, 50.68529901650374],
                                [-1.3256288342685685, 50.68390147076665],
                                [-1.3229893327238516, 50.682661827362196],
                                [-1.3201709033855458, 50.68159201178804],
                                [-1.3172006691067415, 50.68070231502388],
                                [-1.31410720775202, 50.68000129488133],
                                [-1.310920278018322, 50.679495693988684],
                                [-1.3076705341101704, 50.6791903751847],
                                [-1.3043892319684858, 50.67908827493139],
                                [-1.301107929826801, 50.6791903751847],
                                [-1.2978581859186495, 50.679495693988684],
                                [-1.2946712561849516, 50.68000129488133],
                                [-1.29157779483023, 50.68070231502388],
                                [-1.2886075605514258, 50.68159201178804],
                                [-1.2857891312131198, 50.682661827362196],
                                [-1.2831496296684028, 50.68390147076665],
                                [-1.2807144633259298, 50.68529901650374],
                                [-1.2785070799414773, 50.68684101891],
                                [-1.2765487419673855, 50.68851264112838],
                                [-1.2757066090266307, 50.6894019696168],
                                [-1.2752945069397177, 50.71077180584666],
                                [-1.2765347452848725, 50.71208324541508],
                                [-1.2784922211418142, 50.713755767667166],
                                [-1.280699313424364, 50.7152987060773],
                                [-1.2817604623268501, 50.71590803611056],
                                [-1.3270180016101214, 50.71590803611056],
                                [-1.3280791505126075, 50.7152987060773],
                                [-1.3302862427951576, 50.713755767667166],
                                [-1.332243718652099, 50.71208324541508],
                                [-1.3339327389912754, 50.7102972595896],
                                [-1.3353370578425723, 50.70841502215528],
                                [-1.3364431780356287, 50.70645467055292],
                                [-1.3372404801373805, 50.70443509262409],
                                [-1.337721323448196, 50.70237574438141],
                                [-1.337881118133157, 50.700296462392096],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to built up areas - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3307817089774132, 50.7002982808296],
                                [-1.3306537043455995, 50.69865981747808],
                                [-1.3302727850111682, 50.69703718984033],
                                [-1.329642644835858, 50.69544602225959],
                                [-1.3287693758149686, 50.6939016345796],
                                [-1.3276614085097687, 50.692418894758966],
                                [-1.3263294300698543, 50.69101207588979],
                                [-1.324786280665074, 50.68969471899016],
                                [-1.3230468293491122, 50.68847950288168],
                                [-1.3211278305684937, 50.68737812239451],
                                [-1.3190477627100994, 50.686401176061096],
                                [-1.316826650245729, 50.68555806436756],
                                [-1.3144858711825875, 50.68485689953066],
                                [-1.3120479516625931, 50.68430442765704],
                                [-1.3095363496701307, 50.68390596402381],
                                [-1.3069752299064359, 50.68366534209396],
                                [-1.3043892319684858, 50.68358487675001],
                                [-1.3018032340305357, 50.68366534209396],
                                [-1.2992421142668409, 50.68390596402381],
                                [-1.2967305122743786, 50.68430442765704],
                                [-1.2942925927543842, 50.68485689953066],
                                [-1.2919518136912427, 50.68555806436756],
                                [-1.2897307012268724, 50.686401176061096],
                                [-1.2876506333684778, 50.68737812239451],
                                [-1.2857316345878593, 50.68847950288168],
                                [-1.2839921832718975, 50.68969471899016],
                                [-1.2824490338671175, 50.69101207588979],
                                [-1.2811170554272029, 50.692418894758966],
                                [-1.2800090881220032, 50.6939016345796],
                                [-1.2791358191011137, 50.69544602225959],
                                [-1.2785056789258034, 50.69703718984033],
                                [-1.278124759591372, 50.69865981747808],
                                [-1.2779967549595581, 50.7002982808296],
                                [-1.2781229242091139, 50.70193680142868],
                                [-1.278502078693964, 50.703559598609125],
                                [-1.279130592374519, 50.705151041512245],
                                [-1.280002435760741, 50.70669579971383],
                                [-1.2811092330776952, 50.708178991016375],
                                [-1.2824403421377852, 50.70958632497756],
                                [-1.2839829561809597, 50.71090424078458],
                                [-1.2857222267272121, 50.7121200381374],
                                [-1.2876414062769297, 50.713221999868914],
                                [-1.2897220094964115, 50.71419950510982],
                                [-1.2919439913402606, 50.71504313189545],
                                [-1.2942859403915263, 50.71574474821437],
                                [-1.2950064269926786, 50.71590803611056],
                                [-1.313772036944293, 50.71590803611056],
                                [-1.3144925235454452, 50.71574474821437],
                                [-1.316834472596711, 50.71504313189545],
                                [-1.31905645444056, 50.71419950510982],
                                [-1.3211370576600416, 50.713221999868914],
                                [-1.3230562372097592, 50.7121200381374],
                                [-1.3247955077560116, 50.71090424078458],
                                [-1.3263381217991865, 50.70958632497756],
                                [-1.3276692308592761, 50.708178991016375],
                                [-1.3287760281762309, 50.70669579971383],
                                [-1.329647871562453, 50.705151041512245],
                                [-1.3302763852430075, 50.703559598609125],
                                [-1.3306555397278577, 50.70193680142868],
                                [-1.3307817089774132, 50.7002982808296],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'darkRed',
                        issue: 'Too close to built up areas - <= 1km',
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
                        suitability: 'green',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.27519545839354, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to areas of outstanding natural beauty - <= 1.5km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.3020423694391658, 50.678654869791615],
                                [-1.301244129323573, 50.68006664956603],
                                [-1.3004498512932108, 50.68207216823639],
                                [-1.299969582796232, 50.68411735758142],
                                [-1.2998079893966217, 50.6861825251995],
                                [-1.2999666692716545, 50.688247783720904],
                                [-1.300444136209084, 50.69029324228256],
                                [-1.3012358323072133, 50.69229919813698],
                                [-1.3023341703175486, 50.69424632654833],
                                [-1.303728605282024, 50.696115867141174],
                                [-1.3054057348300778, 50.69788980489808],
                                [-1.3073494272181703, 50.69955104405054],
                                [-1.3095409759185705, 50.701083573173094],
                                [-1.3119592792984116, 50.70247261987379],
                                [-1.3145810436770997, 50.70370479357177],
                                [-1.317381007812968, 50.704768214967665],
                                [-1.3203321866514095, 50.70565263094],
                                [-1.3234061319691302, 50.706349513742296],
                                [-1.3265732073750571, 50.70685214352773],
                                [-1.3298028749798867, 50.707155673391696],
                                [-1.3330639909251405, 50.70725717629286],
                                [-1.3363251068703939, 50.707155673391696],
                                [-1.3395547744752236, 50.70685214352773],
                                [-1.3427218498811506, 50.706349513742296],
                                [-1.3457957951988713, 50.70565263094],
                                [-1.3465969302374958, 50.705412544973356],
                                [-1.3465969302374958, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to areas of outstanding natural beauty - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.3104056125431744, 50.67794161161367],
                                [-1.309997892723765, 50.6783723717341],
                                [-1.3088997435382534, 50.67984242373832],
                                [-1.3080342151453634, 50.68137359563333],
                                [-1.3074096631944716, 50.68295114664214],
                                [-1.3070321254460855, 50.684559887986374],
                                [-1.3069052627425706, 50.68618432901239],
                                [-1.3070303227941011, 50.687808826281994],
                                [-1.3074061271653736, 50.68941773419559],
                                [-1.3080290816267057, 50.69099555569835],
                                [-1.308893209808198, 50.69252709161698],
                                [-1.309990209869806, 50.6939975871853],
                                [-1.3113095336756664, 50.69539287434175],
                                [-1.3128384877401484, 50.69669950842098],
                                [-1.3145623549981, 50.69790489791331],
                                [-1.3164645362449505, 50.69899742603197],
                                [-1.3185267098959017, 50.69996656290541],
                                [-1.3207290085295853, 50.70080296730225],
                                [-1.3230502105123294, 50.70149857689688],
                                [-1.3254679448464708, 50.70204668619465],
                                [-1.32795890725177, 50.70244201135558],
                                [-1.3304990853744576, 50.70268074128253],
                                [-1.3330639909251405, 50.70276057447424],
                                [-1.335628896475823, 50.70268074128253],
                                [-1.3381690745985106, 50.70244201135558],
                                [-1.3406600370038098, 50.70204668619465],
                                [-1.3430777713379511, 50.70149857689688],
                                [-1.3453989733206955, 50.70080296730225],
                                [-1.3465969302374958, 50.70034799883562],
                                [-1.3465969302374958, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'darkRed',
                        issue: 'Too close to areas of outstanding natural beauty - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3419963357412428, 50.686542706669115],
                                [-1.3256082576397168, 50.68114467040985],
                                [-1.3241316461090378, 50.68114467040985],
                                [-1.3241316461090378, 50.691229841834996],
                                [-1.3419963357412428, 50.691229841834996],
                                [-1.3419963357412428, 50.686542706669115],
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
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.27519545839354, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to special areas of conservation - <= 1.5km',
                    },
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
                                [-1.2757980199917307, 50.684661791355566],
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
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to sites of special scientific interest - <= 1.5km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.68858760846721],
                                [-1.345649444838062, 50.688303851594256],
                                [-1.3424572282157277, 50.68758058030211],
                                [-1.3391685635334276, 50.68705893129631],
                                [-1.3358150823110972, 50.68674392155482],
                                [-1.332429036881322, 50.68663858061442],
                                [-1.3290429914515474, 50.68674392155482],
                                [-1.325689510229217, 50.68705893129631],
                                [-1.3224008455469167, 50.68758058030211],
                                [-1.3192086289245826, 50.688303851594256],
                                [-1.3161435679800908, 50.68922178880947],
                                [-1.3132351520481889, 50.69032556284243],
                                [-1.3105113692910695, 50.691604556447786],
                                [-1.3079984379824192, 50.69304646600275],
                                [-1.3057205545210924, 50.69463741946864],
                                [-1.3036996605814855, 50.696362109435846],
                                [-1.3019552316362013, 50.698203939991835],
                                [-1.300504088893849, 50.700145186019036],
                                [-1.2993602364821846, 50.70216716340867],
                                [-1.2985347254758313, 50.70425040857023],
                                [-1.2980355461202653, 50.70637486552424],
                                [-1.2978675493415825, 50.70852007878988],
                                [-1.2980323983569417, 50.71066539022045],
                                [-1.298528550915861, 50.71279013789677],
                                [-1.2993512724102554, 50.71487385516581],
                                [-1.2999348847565166, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.68858760846721],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to built up areas - <= 1.5km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.337881118133157, 50.700296462392096],
                                [-1.3377183678498128, 50.69821727259109],
                                [-1.3372346825225123, 50.69615819737058],
                                [-1.3364347612031973, 50.69413906280571],
                                [-1.33532634524651, 50.69217930787088],
                                [-1.333920142310406, 50.69029779747811],
                                [-1.332229721969586, 50.68851264112838],
                                [-1.330271383995494, 50.68684101891],
                                [-1.328064000611042, 50.68529901650374],
                                [-1.3256288342685685, 50.68390147076665],
                                [-1.3229893327238516, 50.682661827362196],
                                [-1.3201709033855458, 50.68159201178804],
                                [-1.3172006691067415, 50.68070231502388],
                                [-1.31410720775202, 50.68000129488133],
                                [-1.310920278018322, 50.679495693988684],
                                [-1.3076705341101704, 50.6791903751847],
                                [-1.3043892319684858, 50.67908827493139],
                                [-1.301107929826801, 50.6791903751847],
                                [-1.2978581859186495, 50.679495693988684],
                                [-1.2946712561849516, 50.68000129488133],
                                [-1.29157779483023, 50.68070231502388],
                                [-1.2886075605514258, 50.68159201178804],
                                [-1.2857891312131198, 50.682661827362196],
                                [-1.2831496296684028, 50.68390147076665],
                                [-1.2807144633259298, 50.68529901650374],
                                [-1.2785070799414773, 50.68684101891],
                                [-1.2765487419673855, 50.68851264112838],
                                [-1.2757066090266307, 50.6894019696168],
                                [-1.2752945069397177, 50.71077180584666],
                                [-1.2765347452848725, 50.71208324541508],
                                [-1.2784922211418142, 50.713755767667166],
                                [-1.280699313424364, 50.7152987060773],
                                [-1.2817604623268501, 50.71590803611056],
                                [-1.3270180016101214, 50.71590803611056],
                                [-1.3280791505126075, 50.7152987060773],
                                [-1.3302862427951576, 50.713755767667166],
                                [-1.332243718652099, 50.71208324541508],
                                [-1.3339327389912754, 50.7102972595896],
                                [-1.3353370578425723, 50.70841502215528],
                                [-1.3364431780356287, 50.70645467055292],
                                [-1.3372404801373805, 50.70443509262409],
                                [-1.337721323448196, 50.70237574438141],
                                [-1.337881118133157, 50.700296462392096],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'amber',
                        issue: 'Close to areas of outstanding natural beauty - <= 1.5km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.3020423694391658, 50.678654869791615],
                                [-1.301244129323573, 50.68006664956603],
                                [-1.3004498512932108, 50.68207216823639],
                                [-1.299969582796232, 50.68411735758142],
                                [-1.2998079893966217, 50.6861825251995],
                                [-1.2999666692716545, 50.688247783720904],
                                [-1.300444136209084, 50.69029324228256],
                                [-1.3012358323072133, 50.69229919813698],
                                [-1.3023341703175486, 50.69424632654833],
                                [-1.303728605282024, 50.696115867141174],
                                [-1.3054057348300778, 50.69788980489808],
                                [-1.3073494272181703, 50.69955104405054],
                                [-1.3095409759185705, 50.701083573173094],
                                [-1.3119592792984116, 50.70247261987379],
                                [-1.3145810436770997, 50.70370479357177],
                                [-1.317381007812968, 50.704768214967665],
                                [-1.3203321866514095, 50.70565263094],
                                [-1.3234061319691302, 50.706349513742296],
                                [-1.3265732073750571, 50.70685214352773],
                                [-1.3298028749798867, 50.707155673391696],
                                [-1.3330639909251405, 50.70725717629286],
                                [-1.3363251068703939, 50.707155673391696],
                                [-1.3395547744752236, 50.70685214352773],
                                [-1.3427218498811506, 50.706349513742296],
                                [-1.3457957951988713, 50.70565263094],
                                [-1.3465969302374958, 50.705412544973356],
                                [-1.3465969302374958, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Bad windspeed - < 4m/s or > 7.5m/s',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.33461711915146, 50.68411208127974],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.275870815939669, 50.680886907570596],
                                [-1.2757872910459838, 50.685218148192405],
                                [-1.33461711915146, 50.685218148192405],
                                [-1.33461711915146, 50.68411208127974],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Bad windspeed - < 4m/s or > 7.5m/s',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3010647701177902, 50.691902878625484],
                                [-1.2756583807758117, 50.691902878625484],
                                [-1.2753654345108338, 50.70709380802265],
                                [-1.3010647701177902, 50.70709380802265],
                                [-1.3010647701177902, 50.691902878625484],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to special areas of conservation - <= 1km',
                    },
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
                                [-1.275709494915657, 50.68925231986295],
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
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to sites of special scientific interest - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.69365359665675],
                                [-1.3453697514599399, 50.693187855845295],
                                [-1.3429342433580485, 50.692458445627594],
                                [-1.340397667985802, 50.69188371855912],
                                [-1.337784431741073, 50.69146920380709],
                                [-1.3351196761837814, 50.69121888908897],
                                [-1.332429036881322, 50.691135182433044],
                                [-1.329738397578863, 50.69121888908897],
                                [-1.3270736420215714, 50.69146920380709],
                                [-1.3244604057768425, 50.69188371855912],
                                [-1.321923830404596, 50.692458445627594],
                                [-1.3194883223027047, 50.693187855845295],
                                [-1.3171773185127338, 50.69406493162277],
                                [-1.3150130617087143, 50.69508123426185],
                                [-1.3130163865090505, 50.69622698491702],
                                [-1.3112065191494637, 50.6974911584369],
                                [-1.3096008924338296, 50.698861589194934],
                                [-1.3082149777407188, 50.700325087903195],
                                [-1.3070621357074803, 50.7018675682979],
                                [-1.3061534870419582, 50.70347418248928],
                                [-1.3054978047257635, 50.70512946368427],
                                [-1.305101428673952, 50.706817474917905],
                                [-1.3049682037055899, 50.708521962369446],
                                [-1.3050994414598696, 50.710226511793465],
                                [-1.3054939066650801, 50.71191470656298],
                                [-1.3061478279348846, 50.71357028580411],
                                [-1.3070549330302297, 50.715177301098095],
                                [-1.307600307748837, 50.71590803611056],
                                [-1.3465969302374958, 50.71590803611056],
                                [-1.3465969302374958, 50.69365359665675],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to built up areas - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3307817089774132, 50.7002982808296],
                                [-1.3306537043455995, 50.69865981747808],
                                [-1.3302727850111682, 50.69703718984033],
                                [-1.329642644835858, 50.69544602225959],
                                [-1.3287693758149686, 50.6939016345796],
                                [-1.3276614085097687, 50.692418894758966],
                                [-1.3263294300698543, 50.69101207588979],
                                [-1.324786280665074, 50.68969471899016],
                                [-1.3230468293491122, 50.68847950288168],
                                [-1.3211278305684937, 50.68737812239451],
                                [-1.3190477627100994, 50.686401176061096],
                                [-1.316826650245729, 50.68555806436756],
                                [-1.3144858711825875, 50.68485689953066],
                                [-1.3120479516625931, 50.68430442765704],
                                [-1.3095363496701307, 50.68390596402381],
                                [-1.3069752299064359, 50.68366534209396],
                                [-1.3043892319684858, 50.68358487675001],
                                [-1.3018032340305357, 50.68366534209396],
                                [-1.2992421142668409, 50.68390596402381],
                                [-1.2967305122743786, 50.68430442765704],
                                [-1.2942925927543842, 50.68485689953066],
                                [-1.2919518136912427, 50.68555806436756],
                                [-1.2897307012268724, 50.686401176061096],
                                [-1.2876506333684778, 50.68737812239451],
                                [-1.2857316345878593, 50.68847950288168],
                                [-1.2839921832718975, 50.68969471899016],
                                [-1.2824490338671175, 50.69101207588979],
                                [-1.2811170554272029, 50.692418894758966],
                                [-1.2800090881220032, 50.6939016345796],
                                [-1.2791358191011137, 50.69544602225959],
                                [-1.2785056789258034, 50.69703718984033],
                                [-1.278124759591372, 50.69865981747808],
                                [-1.2779967549595581, 50.7002982808296],
                                [-1.2781229242091139, 50.70193680142868],
                                [-1.278502078693964, 50.703559598609125],
                                [-1.279130592374519, 50.705151041512245],
                                [-1.280002435760741, 50.70669579971383],
                                [-1.2811092330776952, 50.708178991016375],
                                [-1.2824403421377852, 50.70958632497756],
                                [-1.2839829561809597, 50.71090424078458],
                                [-1.2857222267272121, 50.7121200381374],
                                [-1.2876414062769297, 50.713221999868914],
                                [-1.2897220094964115, 50.71419950510982],
                                [-1.2919439913402606, 50.71504313189545],
                                [-1.2942859403915263, 50.71574474821437],
                                [-1.2950064269926786, 50.71590803611056],
                                [-1.313772036944293, 50.71590803611056],
                                [-1.3144925235454452, 50.71574474821437],
                                [-1.316834472596711, 50.71504313189545],
                                [-1.31905645444056, 50.71419950510982],
                                [-1.3211370576600416, 50.713221999868914],
                                [-1.3230562372097592, 50.7121200381374],
                                [-1.3247955077560116, 50.71090424078458],
                                [-1.3263381217991865, 50.70958632497756],
                                [-1.3276692308592761, 50.708178991016375],
                                [-1.3287760281762309, 50.70669579971383],
                                [-1.329647871562453, 50.705151041512245],
                                [-1.3302763852430075, 50.703559598609125],
                                [-1.3306555397278577, 50.70193680142868],
                                [-1.3307817089774132, 50.7002982808296],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'red',
                        issue: 'Too close to areas of outstanding natural beauty - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3465969302374958, 50.68805808728612],
                                [-1.3147572597099781, 50.67757048191068],
                                [-1.3104056125431744, 50.67794161161367],
                                [-1.309997892723765, 50.6783723717341],
                                [-1.3088997435382534, 50.67984242373832],
                                [-1.3080342151453634, 50.68137359563333],
                                [-1.3074096631944716, 50.68295114664214],
                                [-1.3070321254460855, 50.684559887986374],
                                [-1.3069052627425706, 50.68618432901239],
                                [-1.3070303227941011, 50.687808826281994],
                                [-1.3074061271653736, 50.68941773419559],
                                [-1.3080290816267057, 50.69099555569835],
                                [-1.308893209808198, 50.69252709161698],
                                [-1.309990209869806, 50.6939975871853],
                                [-1.3113095336756664, 50.69539287434175],
                                [-1.3128384877401484, 50.69669950842098],
                                [-1.3145623549981, 50.69790489791331],
                                [-1.3164645362449505, 50.69899742603197],
                                [-1.3185267098959017, 50.69996656290541],
                                [-1.3207290085295853, 50.70080296730225],
                                [-1.3230502105123294, 50.70149857689688],
                                [-1.3254679448464708, 50.70204668619465],
                                [-1.32795890725177, 50.70244201135558],
                                [-1.3304990853744576, 50.70268074128253],
                                [-1.3330639909251405, 50.70276057447424],
                                [-1.335628896475823, 50.70268074128253],
                                [-1.3381690745985106, 50.70244201135558],
                                [-1.3406600370038098, 50.70204668619465],
                                [-1.3430777713379511, 50.70149857689688],
                                [-1.3453989733206955, 50.70080296730225],
                                [-1.3465969302374958, 50.70034799883562],
                                [-1.3465969302374958, 50.68805808728612],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'darkRed',
                        issue: 'Too close to special areas of conservation - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.281658414106687, 50.70186733241772],
                                [-1.2754662233742031, 50.70186733241772],
                                [-1.2752456584821532, 50.71330487610129],
                                [-1.281658414106687, 50.71330487610129],
                                [-1.281658414106687, 50.70186733241772],
                            ],
                        ],
                    },
                },
                {
                    type: 'Feature',
                    properties: {
                        suitability: 'darkRed',
                        issue: 'Too close to sites of special scientific interest - <= 1km',
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
                        suitability: 'darkRed',
                        issue: 'Too close to built up areas - <= 1km',
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
                        suitability: 'darkRed',
                        issue: 'Too close to areas of outstanding natural beauty - <= 1km',
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [-1.3419963357412428, 50.686542706669115],
                                [-1.3256082576397168, 50.68114467040985],
                                [-1.3241316461090378, 50.68114467040985],
                                [-1.3241316461090378, 50.691229841834996],
                                [-1.3419963357412428, 50.691229841834996],
                                [-1.3419963357412428, 50.686542706669115],
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
