import { Request, Response } from "express";
import { SearchOptionDTO } from "../models/search.model";
import { LayersDTO } from "../models/layers.model";
import { AssetsDTO } from "../models/asset.model";
import { GeoJSON, isValidGeoJSON } from "../models/geojson.model";
import * as fs from "fs";
import Fuse from 'fuse.js';
import * as path from "path";

/**
 * Controller for UI-related endpoints
 */
export class UIController {
  private readonly layersDataFilePath: string;
  private readonly assetsDataFilePath: string;
  private readonly sampleGeoJsonFilePath: string;

  private regions: SearchOptionDTO[];
  private fuse: Fuse<SearchOptionDTO>;

  /**
   * Constructor for UIController
   */
  constructor() {
    const filePath = path.join(__dirname, '../data/regions.json');
    const rawJson = fs.readFileSync(filePath, 'utf-8');
    this.regions = JSON.parse(rawJson);

    this.fuse = new Fuse(this.regions, {
      keys: ['name'],
      threshold: 0.3,
      distance: 100,
    });

    this.layersDataFilePath = path.join(__dirname, "../data/layers.json");
    this.assetsDataFilePath = path.join(__dirname, "../data/assets.json");
    this.sampleGeoJsonFilePath = path.join(__dirname, "../data/sampleGeoJson.json");
  }

  /**
   * @swagger
   * /api/ui/search:
   *   get:
   *     summary: Search for a location
   *     description: Returns latitude and longitude coordinates for a given location name.
   *     tags:
   *       - UI
   *     parameters:
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *         required: true
   *         description: Name of the location to search for
   *     responses:
   *       200:
   *         description: Location coordinates retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PositionDTO'
   *       400:
   *         description: Bad request - location parameter is missing.
   */
  public searchLocation(req: Request, res: Response): void {
    const query = req.query.location as string;

    if (!query) {
      res.status(400).json({ error: 'Location parameter is required' });
      return;
    }

    console.debug(`Location search requested for: ${query}`);

    const matches = this.fuse.search(query).slice(0, 10).map(r => r.item);

    res.status(200).json(matches);
  }

  /**
   * @swagger
   * /api/ui/layers/{assetType}:
   *   get:
   *     summary: Get layers information by asset type such as wind turbine
   *     description: Returns layer information for a specific asset type.
   *     tags:
   *       - UI
   *     parameters:
   *       - in: path
   *         name: assetType
   *         schema:
   *           type: string
   *         required: true
   *         description: Type of asset to get layers for
   *     responses:
   *       200:
   *         description: Layers information retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LayersDTO'
   *       404:
   *         description: Layers data file not found.
   *       500:
   *         description: Internal server error.
   */
  public getLayers(req: Request, res: Response): void {
    const assetType = req.params.assetType;

    console.debug(`Layers requested for asset type: ${assetType}`);

    try {
      // Read the layers data from the JSON file
      const layersData = this.readLayersData();

      // In a real application, we might filter the data based on assetType
      // For now, we'll just return all the data regardless of assetType

      res.status(200).json(layersData);
    } catch (error) {
      console.error(`Error retrieving layers data: ${error}`);
      res.status(500).json({ error: "Failed to retrieve layers data" });
    }
  }

  /**
   * Read layers data from the JSON file
   * @returns LayersDTO object containing the layers data
   */
  private readLayersData(): LayersDTO {
    const fileContent = fs.readFileSync(this.layersDataFilePath, 'utf8');
    return JSON.parse(fileContent) as LayersDTO;
  }

  /**
   * @swagger
   * /api/ui/assets:
   *   get:
   *     summary: Get all assets and their attributes
   *     description: Returns all assets and their attributes.
   *     tags:
   *       - UI
   *     responses:
   *       200:
   *         description: Assets retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Asset'
   *               properties:
   *                 id:
   *                   type: string
   *                   description: Unique identifier for the asset
   *                 name:
   *                   type: string
   *                   description: Human-readable name of the asset
   *                 variations:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         description: Name of the variation
   *                       specification:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             key:
   *                               type: string
   *                               description: Key identifier for the specification
   *                             value:
   *                               type: string
   *                               description: Value of the specification
   *                             unit:
   *                               type: string
   *                               description: Unit of measurement
   *                             displayName:
   *                               type: string
   *                               description: Human-readable display name
   *       404:
   *         description: Assets data file not found.
   *       500:
   *         description: Internal server error.
   */
  public getAssets(req: Request, res: Response): void {
    console.debug('Assets requested');

    try {
      // Read the assets data from the JSON file
      const assetsData = this.readAssetsData();

      res.status(200).json(assetsData);
    } catch (error) {
      console.error(`Error retrieving assets data: ${error}`);
      res.status(500).json({ error: "Failed to retrieve assets data" });
    }
  }

  /**
   * Read assets data from the JSON file
   * @returns Array of Asset objects containing the assets data
   */
  private readAssetsData(): AssetsDTO {
    const fileContent = fs.readFileSync(this.assetsDataFilePath, 'utf8');
    return JSON.parse(fileContent) as AssetsDTO;
  }

  /**
   * @swagger
   * /api/ui/layer/{layerId}:
   *   post:
   *     summary: Process GeoJSON data for a specific layer
   *     description: Accepts GeoJSON content and returns the same GeoJSON object.
   *     tags:
   *       - UI
   *     parameters:
   *       - in: path
   *         name: layerId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the layer to process
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/GeoJSON'
   *     responses:
   *       200:
   *         description: GeoJSON processed successfully.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeoJSON'
   *       400:
   *         description: Bad request - invalid GeoJSON data.
   *       500:
   *         description: Internal server error.
   */
  public processLayerGeoJSON(req: Request, res: Response): void {
    const layerId = req.params.layerId;

    console.debug(`Processing GeoJSON for layer ID: ${layerId}`);

    try {
      // Read the sample GeoJSON data from the JSON file
      const geoJsonData = this.readSampleGeoJsonData();

      // Validate that the data is a valid GeoJSON object
      if (!isValidGeoJSON(req.body)) {
        res.status(400).json({ error: "Invalid GeoJSON data" });
        return;
      }

      res.status(200).json(geoJsonData);
    } catch (error) {
      console.error(`Error processing GeoJSON data: ${error}`);
      res.status(500).json({ error: "Failed to process GeoJSON data" });
    }
  }

  /**
   * Read sample GeoJSON data from the JSON file
   * @returns GeoJSON object containing the sample GeoJSON data
   */
  private readSampleGeoJsonData(): GeoJSON {
    const fileContent = fs.readFileSync(this.sampleGeoJsonFilePath, 'utf8');
    return JSON.parse(fileContent) as GeoJSON;
  }
}

export const uiController = new UIController();
