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

    console.log('credential subject ', subject);
    // 1. Load Handlebars template
    const templatePath = path.join(__dirname, '..', 'views', 'credential.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);

    // 2. Read image and convert to Base64
    const logoPath = path.resolve(
      __dirname,
      '..',
      '..',
      'TAN-RC-VC',
      'assets',
      'logoWithoutBackground-B12Zn0N7.png',
    );
    const logoData = fs.readFileSync(logoPath).toString('base64');
    const logoMimeType = 'image/png'; // adjust if your logo is different
    const logoBase64 = `data:${logoMimeType};base64,${logoData}`;

    // 3. Render HTML with Base64 image
    const html = template({ credential, subject, logoBase64 });

    // 4. Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // 5. Generate PDF
    const pdfBuffer = await page.pdf({
      width: '210mm', // A4 width
      height: await page.evaluate(() => document.body.scrollHeight + 'px'),
      printBackground: true,
    });

    await browser.close();

    // 6. Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=credential-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
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
