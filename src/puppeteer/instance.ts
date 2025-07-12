import { Browser, ConsoleMessage, EvaluateFunc, Page } from 'puppeteer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { sleep } from '../util.js';

export enum FoundryStatus {
  STOPPED = 0,
  STARTING = 1,
  LOADING = 2,
  RUNNING = 3,
  STOPPING = 4,
  ERROR = 5,
  RESTARTING = 6,
}

export class FoundryInstance {
  page!: Page;
  url: URL;
  username: string;
  password: string;
  logOutput: boolean;
  TIMEOUT = 300_000;
  status: FoundryStatus;
  loaded = false;
  private _loadStart?: Date;
  private _loadEnd?: Date;
  public loadTime = 0;
  private browser: Browser;

  constructor(
    browser: Browser,
    instanceUrl: string,
    username: string,
    password: string,
  ) {
    this.url = new URL(instanceUrl);
    this.username = username;
    this.password = password;
    this.browser = browser;
    this.logOutput = false;
    this.status = FoundryStatus.STOPPED;
  }

  async init() {
    this.page = await this.browser.newPage();
    this.loaded = true;
    return this;
  }

  getUrl() {
    return this.url.href.replace(/\/(?=$|\?|#)/, '');
  }

  handleFoundryConsole(msg: ConsoleMessage) {
    if (!this) return; // Can accidentally trigger before object is fully initialized?

    if (this.logOutput) {
      const prefix = `[fvtt ][${this.getUrl()}] `;
      const lines = msg.text().split('\n');
      for (const line of lines) {
        console.log(`${prefix}${line}`);
      }
    }
    if (msg.text().includes('Foundry VTT | Server connection lost')) {
      this.status = FoundryStatus.STOPPED;
      console.log(
        `FoundryVTT @ [${this.getUrl()}]: ❌  FoundryVTT disconnected from game.`,
      );
    }
    if (msg.text().includes('Foundry VTT | Prepared World Documents in')) {
      this.status = FoundryStatus.RUNNING;
      this._loadEnd = new Date();
      this.loadTime = this._loadEnd.getTime() - this._loadStart!.getTime();
      console.log(
        `FoundryVTT @ [${this.getUrl()}]: ✅  FoundryVTT logged in to game in ${this.loadTime / 1000}s.`,
      );
    }
  }

  async runFoundry(
    foundryFunction: EvaluateFunc<any>,
    ...args: unknown[]
  ): Promise<any> {
    if (this.status !== FoundryStatus.RUNNING)
      throw new HttpException('World not found', HttpStatus.NOT_FOUND);
    return await this.page.evaluate(foundryFunction, ...args);
  }

  async login() {
    if (!this.loaded) await this.init();
    try {
      this.loadTime = 0;
      this._loadStart = new Date();
      this.status = FoundryStatus.STARTING;

      // Open a new page
      if (!this.page) {
        this.page = await this.browser.newPage();
      }
      this.page.on('console', (msg) => this.handleFoundryConsole(msg));
      await this.page.evaluateOnNewDocument(() => {
        window.localStorage.setItem('core.noCanvas', 'true');
      });

      // Navigate to the Foundry VTT login page
      await this.page.goto(`${this.getUrl()}/join`, {
        waitUntil: 'networkidle2',
        timeout: this.TIMEOUT,
      });
      console.log(
        `FoundryVTT @ [${this.getUrl()}]: Successfully reached foundry login page`,
      );
      await sleep(2000);
      // Enter username and password (replace with your actual credentials)
      await this.page.select('select[name="userid"]', this.username);
      await this.page.type('[name="password"]', this.password);
      console.log(
        `FoundryVTT @ [${this.getUrl()}]: Attempting foundry game login...`,
      );
      // Click the login button
      await this.page.click('button[name="join"]');

      // Wait for navigation to the main page after login
      await this.page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: this.TIMEOUT,
      });
      console.log(
        `FoundryVTT @ [${this.getUrl()}]: Game page navigation finished`,
      );

      this.status = FoundryStatus.LOADING;
    } catch (e) {
      console.error(`FoundryVTT @ [${this.getUrl()}] FoundryVTT error`);
      console.error(e);
      this.status = FoundryStatus.ERROR;
    }
  }
}
