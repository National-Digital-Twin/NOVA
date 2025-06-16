import { Router } from "express";
import { uiController } from "../controllers/ui.controller";
import { Request, Response } from "express";

/**
 * Router for UI-related endpoints
 */
export class UIRoutes {
  public router: Router;

  /**
   * Constructor for UIRoutes
   */
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
   this.router.get("/ui/search", (req: Request, res: Response) => uiController.searchLocation(req, res));
   this.router.get("/ui/layers/:assetType", (req: Request, res: Response) => uiController.getLayers(req, res));
   this.router.get("/ui/assets", (req: Request, res: Response) => uiController.getAssets(req, res));
   this.router.post("/ui/layer/:layerId", (req: Request, res: Response) => uiController.processLayerGeoJSON(req, res));
   this.router.post("/ui/location/analyse/:assetType", (req: Request, res: Response) => uiController.analyseLocation(req, res));
   this.router.post("/ui/asset/analyse", (req: Request, res: Response) => uiController.analyseAsset(req, res));
   this.router.post("/ui/substations", (req: Request, res: Response) => uiController.getSubstations(req, res));
  }
}

// Export a singleton instance
export const uiRoutes = new UIRoutes();
