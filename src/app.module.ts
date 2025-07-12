import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PuppeteerModule } from './puppeteer/puppeteer.module.js';

@Module({
  imports: [PuppeteerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
