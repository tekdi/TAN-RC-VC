import { HttpService } from '@nestjs/axios';
export declare class AppService {
    private readonly httpService;
    private readonly base_url;
    private readonly issuer_id;
    private readonly credential_schema_id;
    constructor(httpService: HttpService);
    issueCredential(body: any): Promise<any>;
    validateIssueCredentialBody(body: any): Promise<void>;
    getCredential(id: string): Promise<any>;
}
