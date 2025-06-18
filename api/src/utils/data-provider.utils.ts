import * as fs from "fs";
import * as path from "path";
import Fuse from "fuse.js";
import { LayersDTO } from "../models/layers.model";
import { AssetsDTO } from "../models/asset.model";
import { GeoJSONDTO } from "../models/geojson.model";
import { LocationsDTO } from "../models/location.model";
import { SearchOptionDTO } from "../models/search.model";

/**
 * Utility class for data providers
 */
export class DataProviderUtils {
  private readonly layersDataFilePath: string;
  private readonly assetsDataFilePath: string;
  private readonly sampleGeoJsonFilePath: string;
  private readonly substationsDataFilePath: string;
  private readonly regionsDataFilePath: string;

  private fuse!: Fuse<SearchOptionDTO>;

  /**
   * Constructor for DataProviderUtils
   */
  constructor() {
    this.regionsDataFilePath = path.resolve(__dirname, "../data/regions.json");
    this.layersDataFilePath = path.resolve(__dirname, "../data/layers.json");
    this.assetsDataFilePath = path.resolve(__dirname, "../data/assets.json");
    this.sampleGeoJsonFilePath = path.resolve(
      __dirname,
      "../data/sampleGeoJson.json"
    );
    this.substationsDataFilePath = path.resolve(
      __dirname,
      "../data/substations.json"
    );
  }

  /**
   * Read layers data from the JSON file
   * @returns LayersDTO object containing the layers data
   */
  public readLayersData(): LayersDTO {
    const fileContent = fs.readFileSync(this.layersDataFilePath, "utf8");
    const layersData = JSON.parse(fileContent) as LayersDTO;

    // Ensure each item has the active property
    layersData.categories.forEach((category) => {
      category.items.forEach((item) => {
        if (item.active === undefined) {
          item.active = false; // Set default value if not present
        }
      });
    });

    return layersData;
  }

  /**
   * Read assets data from the JSON file
   * @returns Array of Asset objects containing the assets data
   */
  public readAssetsData(): AssetsDTO {
    const fileContent = fs.readFileSync(this.assetsDataFilePath, "utf8");
    return JSON.parse(fileContent) as AssetsDTO;
  }

  /**
   * Read sample GeoJSON data from the JSON file
   * @returns GeoJSONDTO object containing the sample GeoJSON data
   */
  public readSampleGeoJsonData(): GeoJSONDTO {
    const fileContent = fs.readFileSync(this.sampleGeoJsonFilePath, "utf8");
    return JSON.parse(fileContent) as GeoJSONDTO;
  }

  /**
   * Read substations data from the JSON file
   * @returns LocationsDTO array containing the substations data
   */
  public readSubstationsData(): LocationsDTO {
    const fileContent = fs.readFileSync(this.substationsDataFilePath, "utf8");
    return JSON.parse(fileContent) as LocationsDTO;
  }

  /**
   * Read regions data from the JSON file and stores into local fuse instance
   */
  private readRegionsData() {
    const fileContent = fs.readFileSync(this.regionsDataFilePath, "utf8");
    const regions = JSON.parse(fileContent) as SearchOptionDTO[];

    this.fuse = new Fuse(regions, {
      keys: ["name"],
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

    return this.fuse
      .search(query)
      .slice(0, 10)
      .map((r) => r.item);
  }
}

export const dataProviderUtils = new DataProviderUtils();
