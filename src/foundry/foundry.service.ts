import { HttpException, HttpStatus, Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Browser, ConsoleMessage, EvaluateFunc, Page } from 'puppeteer';
import { sleep } from '../util.js';
import { FoundryStatus } from './types.js';
import { dotEnv } from '../env.js';

@Injectable()
export class FoundryService implements OnModuleDestroy {
    private browser: Browser | null = null;
    private page: Page | null = null;
    logOutput: boolean = false;
    _status: FoundryStatus = FoundryStatus.STOPPED;
    private TIMEOUT = 300_000;
    private loaded = false;
    private _loadStart?: Date;
    private _loadEnd?: Date;
    loadTime = 0;

    async createBrowser(): Promise<void> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({ headless: true });
        }
    }

    get status(): FoundryStatus {
        return this._status;
    }

    set status(newStatus: FoundryStatus) {
        console.log(`FoundryVTT @ [${this.url}]: ℹ️ Status changed ${FoundryStatus[this._status]} -> ${FoundryStatus[newStatus]}`);
        this._status = newStatus;
    }

    async getBrowser(): Promise<Browser> {
        if (!this.browser) {
            await this.createBrowser();
        }
        return this.browser!;
    }

    async getPage(): Promise<Page> {
        if (this.page) return this.page;
        const page = await (await this.getBrowser()).newPage();
        this.page = page;
        return page;
    }

    get url() {
        if (!dotEnv.FOUNDRY_HOST) throw new Error('Environment variable `FOUNDRY_HOST` not set.');
        const _url = new URL(dotEnv.FOUNDRY_HOST);
        return _url.href.replace(/\/(?=$|\?|#)/, '');
    }

    async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.closeBrowser();
    }

    handleFoundryConsole(msg: ConsoleMessage) {
        if (!this) return; // Can accidentally trigger before object is fully initialized?

        if (this.logOutput) {
            const prefix = `[fvtt ][${this.url}] `;
            const lines = msg.text().split('\n');
            for (const line of lines) {
                console.log(`${prefix}${line}`);
            }
        }
        if (msg.text().includes('Foundry VTT | Server connection lost')) {
            this.status = FoundryStatus.STOPPED;
            console.log(`FoundryVTT @ [${this.url}]: ❌  FoundryVTT disconnected from game.`);
        }
        if (msg.text().includes('Foundry VTT | Prepared World Documents in')) {
            this.status = FoundryStatus.RUNNING;
            this._loadEnd = new Date();
            this.loadTime = this._loadEnd.getTime() - this._loadStart!.getTime();
            console.log(`FoundryVTT @ [${this.url}]: ✅  FoundryVTT logged in to game in ${this.loadTime / 1000}s.`);
        }
    }

    async runFoundry(foundryFunction: EvaluateFunc<any>, ...args: unknown[]): Promise<any> {
        if (this.status !== FoundryStatus.RUNNING) {
            await this.login();
            //     throw new HttpException(`Foundry not connected: ${this.status}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return await (await this.getPage()).evaluate(foundryFunction, ...args);
    }

    async login() {
        try {
            this.loadTime = 0;
            this._loadStart = new Date();
            this.status = FoundryStatus.STARTING;

            await this.getPage();
            if (!this.page) throw new Error('Unable to create browser page.');

            this.page.on('console', (msg) => this.handleFoundryConsole(msg));
            await this.page.evaluateOnNewDocument(() => {
                window.localStorage.setItem('core.noCanvas', 'true');
            });

            // Navigate to the Foundry VTT login page
            await this.page.goto(`${this.url}/join`, {
                waitUntil: 'networkidle2',
                timeout: this.TIMEOUT,
            });
            console.log(`FoundryVTT @ [${this.url}]: Successfully reached foundry login page`);
            await sleep(2000);
            // Enter username and password (replace with your actual credentials)
            await this.page.select('select[name="userid"]', dotEnv.FOUNDRY_USER);
            await this.page.type('[name="password"]', dotEnv.FOUNDRY_PASS);
            console.log(`FoundryVTT @ [${this.url}]: Attempting foundry game login...`);
            // Click the login button
            await this.page.click('button[name="join"]');

            // Wait for navigation to the main page after login
            await this.page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: this.TIMEOUT,
            });
            console.log(`FoundryVTT @ [${this.url}]: Game page navigation finished`);

            this.status = FoundryStatus.LOADING;
        } catch (e) {
            console.error(`FoundryVTT @ [${this.url}] FoundryVTT error`);
            console.error(e);
            this.status = FoundryStatus.ERROR;
        }
    }
}
