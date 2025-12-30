import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import * as Handlebars from 'handlebars';

async function bootstrap() {
  // ✅ Register helpers BEFORE app starts
  Handlebars.registerHelper('eq', (a, b) => a === b);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Resolve the assets folder based on project root
  const assetsPath = join(__dirname, '..', '..', 'TAN-RC-VC', 'assets');

  // Optional: check if the path exists
  if (!existsSync(assetsPath)) {
    console.error('Assets folder not found at', assetsPath);
  }

  app.useStaticAssets(assetsPath, {
    prefix: '/assets', // keeps your URLs as /assets/filename.png
  });

  console.log('Serving assets from:', assetsPath);
  console.log('Exists:', existsSync(assetsPath));

  // Set the folder where templates are located
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
