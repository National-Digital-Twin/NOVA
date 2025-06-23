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
});
