import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PuppeteerService } from './puppeteer/puppeteer.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly browser: PuppeteerService,
  ) {}

  @Get()
  async getHello(): Promise<ReadyGame> {
    const instance = await this.browser.getInstance();
    const foundryGame = (await instance.runFoundry(() => {
      return game;
    })) as ReadyGame;
    return foundryGame;
  }

  @Get('world')
  async getWorld(): Promise<World> {
    const instance = await this.browser.getInstance();
    const world = (await instance.runFoundry(() => {
      return game.world;
    })) as World;
    return world;
  }
}
