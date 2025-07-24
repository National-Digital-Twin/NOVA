import { Request, Response, Router } from 'express';
import { authController } from '../controllers/auth.controller';

export class AuthRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/auth/user', (req: Request, res: Response) => authController.getUser(req, res));
        this.router.get('/auth/logout', (req: Request, res: Response) => authController.logout(req, res));
    }
}

export const authRoutes = new AuthRoutes();
