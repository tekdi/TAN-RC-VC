"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtAuthMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let JwtAuthMiddleware = JwtAuthMiddleware_1 = class JwtAuthMiddleware {
    constructor() {
        this.logger = new common_1.Logger(JwtAuthMiddleware_1.name);
    }
    async use(req, res, next) {
        try {
            const authHeader = req.headers["authorization"] || req.headers["Authorization"];
            if (!authHeader || Array.isArray(authHeader)) {
                throw new common_1.UnauthorizedException("Missing Authorization header");
            }
            const [scheme, token] = authHeader.split(" ");
            if (scheme !== "Bearer" || !token) {
                throw new common_1.UnauthorizedException("Invalid Authorization header format");
            }
            const secret = process.env.SECRET_KEY;
            if (!secret) {
                this.logger.error("JWT_SECRET is not configured");
                throw new common_1.UnauthorizedException("Authentication is not configured");
            }
            const decoded = jwt.verify(token, secret);
            if (!decoded?.org) {
                throw new common_1.UnauthorizedException("Token payload missing 'org'");
            }
            console.log("decoded org ", decoded.org);
            const isOrgValid = process.env.ORGANIZATIONS.includes(decoded.org);
            console.log("isOrgValid ", isOrgValid);
            if (!isOrgValid) {
                throw new common_1.UnauthorizedException("Organization not authorized");
            }
            req.user = decoded;
            return next();
        }
        catch (error) {
            this.logger.warn(`JWT verification failed: ${error.message}`);
            throw new common_1.UnauthorizedException("Invalid or expired token");
        }
    }
};
exports.JwtAuthMiddleware = JwtAuthMiddleware;
exports.JwtAuthMiddleware = JwtAuthMiddleware = JwtAuthMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtAuthMiddleware);
//# sourceMappingURL=jwt.auth.middleware.js.map