import * as fs from 'fs';
import Fuse, { FuseResult } from 'fuse.js';
import { FeatureCollection, GeoJSON, MultiPolygon } from 'geojson';
import * as path from 'path';
import { AssetsDTO } from '../models/asset.model';
import { LayersDTO } from '../models/layers.model';
import { LocationsDTO } from '../models/location.model';
import { SearchOptionDTO } from '../models/search.model';

/**
 * Utility class for data providers
 */
export class DataProviderUtils {
    private readonly layersDataFilePath: string;
    private readonly assetsDataFilePath: string;
    private readonly sampleGeoJsonFilePath: string;
    private readonly substationsDataFilePath: string;
    private readonly gspDataFilePath: string;
    private readonly regionsDataFilePath: string;
    private readonly windspeedLayerDataFilePath: string;
    private readonly specialAreasOfConservationLayerDataFilePath: string;
    private readonly specialAreasOfConservationBufferedLayerDataFilePath: string;
    private readonly specialAreasOfConservationBuffered1_5KmLayerDataFilePath: string;
    private readonly sitesOfSpecialScientificInterestLayerDataFilePath: string;
    private readonly builtupAreasLayerDataFilePath: string;
    private readonly areasOfNaturalBeautyLayerDataFilePath: string;
    private fuse: Fuse<SearchOptionDTO> | undefined;

    /**
     * Constructor for DataProviderUtils
     */
    constructor() {
        this.regionsDataFilePath = path.join(__dirname, '../data/regions.json');
        this.layersDataFilePath = path.join(__dirname, '../data/layers.json');
        this.assetsDataFilePath = path.join(__dirname, '../data/assets.json');
        this.sampleGeoJsonFilePath = path.join(__dirname, '../data/sampleGeoJson.json');
        this.substationsDataFilePath = path.join(__dirname, '../data/substations.json');
        this.gspDataFilePath = path.join(__dirname, '../data/GSP.geojson');
        this.windspeedLayerDataFilePath = path.join(__dirname, '../data/windspeed.geojson');
        this.specialAreasOfConservationLayerDataFilePath = path.join(__dirname, '../data/sac.geojson');
        this.specialAreasOfConservationBufferedLayerDataFilePath = path.join(__dirname, '../data/sac-1km.geojson');
        this.specialAreasOfConservationBuffered1_5KmLayerDataFilePath = path.join(__dirname, '../data/sac-1_5km.geojson');
        this.sitesOfSpecialScientificInterestLayerDataFilePath = path.join(__dirname, '../data/sssi.geojson');
        this.builtupAreasLayerDataFilePath = path.join(__dirname, '../data/bua.geojson');
        this.areasOfNaturalBeautyLayerDataFilePath = path.join(__dirname, '../data/areanb.geojson');
    }

    /**
     * Read layers data from the JSON file
     * @returns LayersDTO object containing the layers data
     */
    public readLayersData(): LayersDTO {
        const fileContent = fs.readFileSync(this.layersDataFilePath, 'utf8');
        const layersData = JSON.parse(fileContent) as LayersDTO;
        return layersData;
    }

    /**
     * Read assets data from the JSON file
     * @returns Array of Asset objects containing the assets data
     */
    public readAssetsData(): AssetsDTO {
        const fileContent = fs.readFileSync(this.assetsDataFilePath, 'utf8');
        return JSON.parse(fileContent) as AssetsDTO;
    }

    /**
     * Read sample GeoJSON data from the JSON file
     * @returns GeoJSON object containing the sample GeoJSON data
     */
    public readSampleGeoJsonData(): GeoJSON {
        const fileContent = fs.readFileSync(this.sampleGeoJsonFilePath, 'utf8');
        return JSON.parse(fileContent) as GeoJSON;
    }

    /**
     * Read substations data from the JSON file
     * @returns LocationsDTO array containing the substations data
     */
    public readSubstationsData(): LocationsDTO {
        const fileContent = fs.readFileSync(this.substationsDataFilePath, 'utf8');
        return JSON.parse(fileContent) as LocationsDTO;
    }

    /**
     * Read GSP data from the GeoJSON file
     * @returns GeoJSON object containing the GSP data
     */
    public readGSPData(): FeatureCollection {
        const fileContent = fs.readFileSync(this.gspDataFilePath, 'utf8');
        return JSON.parse(fileContent) as FeatureCollection;
    }

    /**
     * Read regions data from the JSON file and stores into local fuse instance
     */
    private readRegionsData() {
        const fileContent = fs.readFileSync(this.regionsDataFilePath, 'utf8');
        const regions = JSON.parse(fileContent) as SearchOptionDTO[];

        this.fuse = new Fuse(regions, {
            keys: ['name'],
            threshold: 0.3,
            distance: 100,
        });
    }

    /**
     * @returns SearchOptionDTO array containing the matches relevant to the input string
     */
    public getSearchOptions(query: string): SearchOptionDTO[] {
        if (!this.fuse) {
            this.readRegionsData();
        }

        return (this.fuse?.search(query) ?? []).slice(0, 10).map((r: FuseResult<SearchOptionDTO>) => r.item);
    }

    public getWindspeedLayerData(): FeatureCollection<MultiPolygon> {
        const fileContent = fs.readFileSync(this.windspeedLayerDataFilePath, 'utf8');

        return JSON.parse(fileContent) as FeatureCollection<MultiPolygon>;
    }

    public getSpecialAreasOfConservationLayerData(): FeatureCollection<MultiPolygon> {
        const fileContent = fs.readFileSync(this.specialAreasOfConservationLayerDataFilePath, 'utf8');

        return JSON.parse(fileContent) as FeatureCollection<MultiPolygon>;
    }

    public getSpecialAreasOfConservationBufferedLayerData(): FeatureCollection<MultiPolygon> {
        const fileContent = fs.readFileSync(this.specialAreasOfConservationBufferedLayerDataFilePath, 'utf8');

        return JSON.parse(fileContent) as FeatureCollection<MultiPolygon>;
    }

    public getSpecialAreasOfConservationBuffered1_5KmLayerData(): FeatureCollection<MultiPolygon> {
        const fileContent = fs.readFileSync(this.specialAreasOfConservationBuffered1_5KmLayerDataFilePath, 'utf8');

        return JSON.parse(fileContent) as FeatureCollection<MultiPolygon>;
    }

    public getSitesOfSpecialScientificInterestLayerData(): FeatureCollection<MultiPolygon> {
        const fileContent = fs.readFileSync(this.sitesOfSpecialScientificInterestLayerDataFilePath, 'utf8');

        return JSON.parse(fileContent) as FeatureCollection<MultiPolygon>;
    }

    public getBuiltupAreasLayerData(): FeatureCollection<MultiPolygon> {
        const fileContent = fs.readFileSync(this.builtupAreasLayerDataFilePath, 'utf8');

        return JSON.parse(fileContent) as FeatureCollection<MultiPolygon>;
    }

    public getAreasOfNaturalBeautyLayerData(): FeatureCollection<MultiPolygon> {
        const fileContent = fs.readFileSync(this.areasOfNaturalBeautyLayerDataFilePath, 'utf8');

        return JSON.parse(fileContent) as FeatureCollection<MultiPolygon>;
    }
}

export const dataProviderUtils = new DataProviderUtils();
