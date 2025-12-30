import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';

@Controller('tan-vc')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('issue-credential')
  async issueCredential(@Body() body: any) {
    console.log('hitting api issue-credentials------------------>>>');
    return this.appService.issueCredential(body);
  }

  @Get('credentials/:id')
  async getCredentialPdf(@Param('id') id: string, @Res() res: Response) {
    const credential = await this.appService.getCredential(id);
    const subject = credential?.credentialSubject;

    if (Array.isArray(subject?.documents)) {
      subject.documents = subject.documents.map((d, index) => ({
        index: index + 1,
        name: d.name,
        url: d.url,
        shortUrl:
          d.url && d.url.length > 40 ? d.url.slice(0, 37) + '...' : d.url,
      }));
    }

    const templatePath = path.join(__dirname, '..', 'views', 'credential.hbs');
    const template = Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));

    const logoBase64 = `data:image/png;base64,${fs
      .readFileSync(
        path.resolve(
          __dirname,
          '..',
          '..',
          'TAN-RC-VC',
          'assets',
          'logoWithoutBackground-B12Zn0N7.png',
        ),
      )
      .toString('base64')}`;

    const html = template({ credential, subject, logoBase64 });

    const browser = await puppeteer.launch({
      headless: 'shell',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.emulateMediaType('screen');

    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename="credential.pdf"',
      'Content-Encoding': 'identity',
    });

    res.end(pdfBuffer);
    return;
  }

  @Get('credentials/details/:id')
  async getCredentialsById(@Param('id') id: string, @Res() res: Response) {
    if (!id || id.trim() === '') {
      console.log('herer');
      return res.status(400).json({
        message: 'Credential id is mandatory',
      });
    } else {
      try {
        const response = await this.appService.getCredential(id);

        if (!response) {
          return res.status(404).json({
            message: 'Credential not found',
          });
        }

        return res.status(200).json({
          data: response,
        });
      } catch (error) {
        console.error('Get credential failed:', error);

        return res.status(500).json({
          message: 'Failed to fetch credential',
        });
      }
    }
  }
}
