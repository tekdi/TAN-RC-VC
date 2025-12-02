import { Injectable, Logger, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtAuthMiddleware.name);

  constructor() { }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers["authorization"] || req.headers["Authorization"];

      if (!authHeader || Array.isArray(authHeader)) {
        throw new UnauthorizedException("Missing Authorization header");
      }

      const [scheme, token] = authHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new UnauthorizedException("Invalid Authorization header format");
      }

      const secret = process.env.SECRET_KEY;
      if (!secret) {
        this.logger.error("JWT_SECRET is not configured");
        throw new UnauthorizedException("Authentication is not configured");
      }

      const decoded: any = jwt.verify(token, secret);

      if (!decoded?.org) {
        throw new UnauthorizedException("Token payload missing 'org'");
      }
      console.log("decoded org ", decoded.org);
      const isOrgValid = process.env.ORGANIZATIONS.includes(decoded.org);
      console.log("isOrgValid ", isOrgValid);
      if (!isOrgValid) {
        throw new UnauthorizedException("Organization not authorized");
      }

      // Attach decoded payload for downstream handlers if needed
      (req as any).user = decoded;

      return next();
    } catch (error: any) {
      this.logger.warn(`JWT verification failed: ${error.message}`);
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
} 
