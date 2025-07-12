import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service.js';
import { dotEnv } from '../env.js';

@Module({
  providers: [PuppeteerService],
  exports: [PuppeteerService],
})
export class PuppeteerModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  async onModuleInit() {
    await this.puppeteerService.createBrowser();
    const instance = await this.puppeteerService.getInstance(
      dotEnv.FOUNDRY_URL,
    );
    void instance.login();
  }

  async onModuleDestroy() {
    await this.puppeteerService.closeBrowser();
  }
}
