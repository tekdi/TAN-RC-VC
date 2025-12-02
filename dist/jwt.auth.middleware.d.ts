import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
export declare class JwtAuthMiddleware implements NestMiddleware {
    private readonly logger;
    constructor();
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
