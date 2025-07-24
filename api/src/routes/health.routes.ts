import { Request, Response, Router } from 'express';
import { healthController } from '../controllers/health.controller';
/**
 * Router for health-related endpoints
 */
export class HealthRoutes {
    public router: Router;

    /**
     * Constructor for HealthRoutes
     */
    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    /**
     * Initialize routes
     */
    private initializeRoutes(): void {
        this.router.get('/health', (req: Request, res: Response) => healthController.healthCheck(req, res));
    }
}

// Export a singleton instance
export const healthRoutes = new HealthRoutes();
