import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class AppService {
  private readonly base_url = process.env.base_url;
  private readonly issuer_id = process.env.issuer_id;
  private readonly credential_schema_id = process.env.credential_schema_id;
  constructor(private readonly httpService: HttpService) {}

  async issueCredential(body): Promise<any> {
    try {
      // Validate body first
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
            documents: Array.isArray(body.documents)
              ? JSON.stringify(body.documents)
              : body.documents,
          },
        },
        credentialSchemaId: this.credential_schema_id,
        credentialSchemaVersion: '1.2.0',
        tags: ['tag1', 'tag2', 'tag3'],
        method: 'cbse',
      };

      const config = {
        headers: { 'Content-Type': 'application/json' },
        maxBodyLength: Infinity,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.base_url}/credentials/credentials/issue`,
          data,
          config,
        ),
      );

      const issuedCredential = response.data;

      const subject = issuedCredential?.credential?.credentialSubject;
      if (subject?.documents && typeof subject.documents === 'string') {
        try {
          subject.documents = JSON.parse(subject.documents);
        } catch {
          // if parsing fails, keep original value
        }
      }

      return issuedCredential;
    } catch (error) {
      // Validation errors: return 400
      if (
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.BAD_REQUEST
      ) {
        throw error; // rethrow as-is
      }

      // Any other errors (network, http service, etc.) → 500
      console.error('Issue credential failed:', error);
      throw new HttpException(
        'Failed to issue credential',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateIssueCredentialBody(body: any) {
    const requiredFields = [
      'first_name',
      'last_name',
      'organisation_name',
      'legal_name',
      'techmahindra_partner',
      'pan',
      'documents',
    ];

    const missingFields = requiredFields.filter((field) => !body?.[field]);

    const fields = Object.keys(body);

    const nullFields = fields.filter(
      (field) => body[field] === null || body[field] === undefined,
    );

    if (nullFields.length > 0) {
      throw new HttpException(
        {
          message: 'Null values are not allowed',
          fields: nullFields,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (missingFields.length > 0) {
      throw new HttpException(
        `Missing mandatory fields: ${missingFields.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    //  documents must be a non-empty array
    if (!Array.isArray(body.documents) || body.documents.length === 0) {
      throw new HttpException(
        'Documents cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Optional documents validation...
  }
  async getCredential(id: string): Promise<any> {
    const url = `${this.base_url}/credentials/credentials/${id}`;
    const headers = {
      Accept: 'application/json',
      templateId: 'clj6oic5i0000iz4olldotf9g',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );

      const issuedCredential = response.data;

      const subject =
        issuedCredential?.credential?.credentialSubject ||
        issuedCredential?.credentialSubject;

      if (subject?.documents && typeof subject.documents === 'string') {
        try {
          subject.documents = JSON.parse(subject.documents);
        } catch {
          // if parsing fails, keep original value
        }
      }

      return issuedCredential;
    } catch (error) {
      if (error instanceof AxiosError) {
        // 👇 Downstream 404 → return null
        if (error.response?.status === 404) {
          return null;
        }
      }

      // 👇 Any other error should bubble up
      throw error;
    }
  }
}
