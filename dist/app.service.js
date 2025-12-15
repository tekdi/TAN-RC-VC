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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const axios_2 = require("axios");
let AppService = class AppService {
    constructor(httpService) {
        this.httpService = httpService;
        this.base_url = process.env.base_url;
        this.issuer_id = process.env.issuer_id;
        this.credential_schema_id = process.env.credential_schema_id;
    }
    async issueCredential(body) {
        try {
            await this.validateIssueCredentialBody(body);
            const data = {
                credential: {
                    '@context': [
                        'https://www.w3.org/2018/credentials/v1',
                        'https://tekdi.github.io/TAN-RC-VC/Context-TAN-VC.json',
                    ],
                    type: ['VerifiableCredential'],
                    issuer: this.issuer_id,
                    issuanceDate: '2025-09-25T11:56:27.259Z',
                    expirationDate: '2027-02-08T11:56:27.259Z',
                    credentialSubject: {
                        id: 'did:rcw:6b9d7b31-bc7f-454a-be30-b6c7447b1cff',
                        type: 'TANCredentialsCertificate',
                        ...body,
                    },
                },
                credentialSchemaId: this.credential_schema_id,
                credentialSchemaVersion: '1.0.0',
                tags: ['tag1', 'tag2', 'tag3'],
                method: 'cbse',
            };
            const config = {
                headers: { 'Content-Type': 'application/json' },
                maxBodyLength: Infinity,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.base_url}/credentials/credentials/issue`, data, config));
            return response.data;
        }
        catch (error) {
            if (error instanceof common_1.HttpException &&
                error.getStatus() === common_1.HttpStatus.BAD_REQUEST) {
                throw error;
            }
            console.error('Issue credential failed:', error);
            throw new common_1.HttpException('Failed to issue credential', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async validateIssueCredentialBody(body) {
        const requiredFields = [
            'first_name',
            'last_name',
            'organisation_name',
            'legal_name',
            'techmahindra_partner',
            'pan',
        ];
        const missingFields = requiredFields.filter((field) => !body?.[field]);
        const fields = Object.keys(body);
        const nullFields = fields.filter((field) => body[field] === null || body[field] === undefined);
        if (nullFields.length > 0) {
            throw new common_1.HttpException({
                message: 'Null values are not allowed',
                fields: nullFields,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (missingFields.length > 0) {
            throw new common_1.HttpException(`Missing mandatory fields: ${missingFields.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getCredential(id) {
        const url = `${this.base_url}/credentials/credentials/${id}`;
        const headers = {
            Accept: 'application/json',
            templateId: 'clj6oic5i0000iz4olldotf9g',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            return response.data;
        }
        catch (error) {
            if (error instanceof axios_2.AxiosError) {
                if (error.response?.status === 404) {
                    return null;
                }
            }
            throw error;
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AppService);
//# sourceMappingURL=app.service.js.map