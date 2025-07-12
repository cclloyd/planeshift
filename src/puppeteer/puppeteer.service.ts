import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';
import { dotEnv } from '../env.js';
import { FoundryInstance } from './instance.js';

@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  private browser: Browser | null = null;
  private instances: Map<string, FoundryInstance> = new Map();

  async createBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: true });
    }
  }

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      await this.createBrowser();
    }
    return this.browser!;
  }

  async getInstance(instanceUrl?: string): Promise<FoundryInstance> {
    const foundryUrl = instanceUrl ?? dotEnv.FOUNDRY_URL;
    if (this.instances.has(foundryUrl)) {
      return this.instances.get(foundryUrl)!;
    }

    const browser = await this.getBrowser();
    const instance = new FoundryInstance(
      browser,
      dotEnv.FOUNDRY_URL,
      dotEnv.FOUNDRY_USER,
      dotEnv.FOUNDRY_PASS,
    );
    this.instances.set(foundryUrl, instance);
    return instance;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.instances.clear();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeBrowser();
  }
}
