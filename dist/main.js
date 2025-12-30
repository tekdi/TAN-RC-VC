"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs_1 = require("fs");
const Handlebars = require("handlebars");
async function bootstrap() {
    Handlebars.registerHelper('eq', (a, b) => a === b);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const assetsPath = (0, path_1.join)(__dirname, '..', '..', 'TAN-RC-VC', 'assets');
    if (!(0, fs_1.existsSync)(assetsPath)) {
        console.error('Assets folder not found at', assetsPath);
    }
    app.useStaticAssets(assetsPath, {
        prefix: '/assets',
    });
    console.log('Serving assets from:', assetsPath);
    console.log('Exists:', (0, fs_1.existsSync)(assetsPath));
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
//# sourceMappingURL=main.js.map