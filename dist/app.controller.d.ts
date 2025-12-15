import { AppService } from './app.service';
import { Response } from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    issueCredential(body: any): Promise<any>;
    getCredentialPdf(id: string, res: Response): Promise<void>;
    getCredentialsById(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
