import { HttpException, HttpStatus, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Browser, ConsoleMessage, EvaluateFunc, Page, TimeoutError } from 'puppeteer';
import { sleep } from '../util.js';
import { FoundryStatus } from './types.js';
import { dotEnv } from '../env.js';

export class FoundryError extends Error {
    public readonly code: string;
    public readonly details?: string;

    constructor(details: string | undefined, code: string) {
        super(`${details}`.trim());
        this.name = 'FoundryError';
        this.code = code;
        this.details = `${details}`.trim();

        // Ensures the error stack traces correctly point to this class.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FoundryError);
        }
    }
}

@Injectable()
export class FoundryService implements OnModuleDestroy {
    private readonly logger = new Logger(FoundryService.name);
    private browser: Browser | null = null;
    private page: Page | null = null;
    logOutput: boolean = false;
    _status: FoundryStatus = FoundryStatus.STOPPED;
    private TIMEOUT = 10_000;
    private loaded = false;
    private _loadStart?: Date;
    private _loadEnd?: Date;
    loadTime = 0;
    private _lastRetry: Date | null = null;
    private _error: Error | null = null;

    async createBrowser(): Promise<void> {
        if (!this.browser) {
            const options =
                process.env.NODE_ENV === 'production'
                    ? { headless: true, args: ['--no-sandbox'], executablePath: '/usr/bin/chromium' }
                    : { headless: true, args: ['--no-sandbox'] };
            this.logger.log(`Starting browser with options: ${JSON.stringify(options)}`);
            this.browser = await puppeteer.launch(options);
        }
    }

    get error(): Error | null {
        return this._error;
    }

    get statusText(): string {
        return FoundryStatus[this._status];
    }

    get status(): FoundryStatus {
        return this._status;
    }

    set status(newStatus: FoundryStatus) {
        this.logger.log(`ℹ️ Status changed ${FoundryStatus[this._status]} -> ${FoundryStatus[newStatus]}`);
        this._status = newStatus;
    }

    async getBrowser(): Promise<Browser> {
        if (!this.browser) {
            this.logOutput = dotEnv.FOUNDRY_LOG_ENABLED;
            await this.createBrowser();
        }
        return this.browser!;
    }

    async getPage(force = false): Promise<Page> {
        if (this.page) {
            if (!force) return this.page;
            await this.page.close();
            this.page = null;
        }
        const page = await (await this.getBrowser()).newPage();
        this.page = page;
        return page;
    }

    get url() {
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
            const prefix = `[fvtt] `;
            const lines = msg.text().split('\n');
            for (const line of lines) {
                this.logger.log(`${prefix}${line}`);
            }
        }
        if (msg.text().startsWith('[Intercepted WebSocket connection attempt]')) {
            this.logger.warn(msg.text());
        }
        if (msg.text().includes('The game world is shutting down')) {
            this.status = FoundryStatus.STOPPED;
            this._error = new FoundryError(`FoundryVTT game has been shut down.  Re-launch the game to access the API.`, 'SERVER_DISCONNECTED');
            this.logger.log(`❌  FoundryVTT game world has been shut down.`);
        }
        if (msg.text().includes('Foundry VTT | Server connection lost')) {
            this.status = FoundryStatus.ERROR;
            this._error = new FoundryError(`FoundryVTT server connection lost.  Attempting to reestablish.`, 'SERVER_DISCONNECTED');
            this.logger.log(`❌  FoundryVTT disconnected from game.`);
        }
        if (msg.text().includes('Foundry VTT | Connected to server socket using session')) {
            if (this.page!.url() === `${this.url}/join`) void this.login();
            // TODO: See if this trigger can be used on the other page to detect when fully loaded, or when `game` is populated at least.
        }
        if (msg.text().includes('Foundry VTT | Prepared World Documents in')) {
            this.status = FoundryStatus.RUNNING;
            this._loadEnd = new Date();
            this.loadTime = this._loadEnd.getTime() - this._loadStart!.getTime();
            this.logger.log(`✅  FoundryVTT logged in to game in ${this.loadTime / 1000}s.`);
        }
    }

    async runFoundry(foundryFunction: EvaluateFunc<any>, ...args: unknown[]): Promise<any> {
        if (this.status === FoundryStatus.STOPPED || this.status === FoundryStatus.ERROR) {
            const now = new Date();
            if (!this._lastRetry || now.getTime() - this._lastRetry.getTime() > 30_000) {
                this._lastRetry = now;
                await this.connectToFoundry();
            }
        }

        if (this.status === FoundryStatus.STARTING) throw new HttpException(`API connection is starting...`, HttpStatus.SERVICE_UNAVAILABLE);
        if (this.status === FoundryStatus.RESTARTING) throw new HttpException(`API connection is restarting...`, HttpStatus.SERVICE_UNAVAILABLE);
        if (this.status === FoundryStatus.LOADING) throw new HttpException(`API connection still loading...`, HttpStatus.SERVICE_UNAVAILABLE);
        if (this.status === FoundryStatus.CONNECTING) throw new HttpException(`API connection still connecting...`, HttpStatus.SERVICE_UNAVAILABLE);
        if (this.status === FoundryStatus.ERROR)
            throw new HttpException(`FoundryVTT Error: ${this._error?.message ?? 'unknown error'}`, HttpStatus.SERVICE_UNAVAILABLE);

        try {
            return await (await this.getPage()).evaluate(foundryFunction, ...args);
        } catch (err) {
            throw new HttpException(`Unable to connect to foundry: ${err}`, HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    handleFoundryError(e: any) {
        this.status = FoundryStatus.ERROR;
        this._error = e as Error;
        if (e instanceof FoundryError) {
            this.logger.error(`❌  ${e.message}`);
        } else if (e instanceof TimeoutError) {
            this.logger.error(`❌  Unable to connect to foundry: timeout.  Make sure it's reachable from this host.`);
        } else {
            this.logger.error(`FoundryVTT error`);
            this.logger.error(e);
        }
    }

    async connectToFoundry() {
        try {
            this.loadTime = 0;
            this._loadStart = new Date();
            this.status = FoundryStatus.STARTING;
            this._error = null;

            await this.getPage(true);
            if (!this.page) throw new Error('Unable to create browser page.');

            this.page.on('console', (msg) => this.handleFoundryConsole(msg));
            await this.page.evaluateOnNewDocument(() => {
                window.localStorage.setItem('core.noCanvas', 'true');
            });

            // Navigate to the Foundry VTT connectToFoundry page
            await this.page.goto(`${this.url}/join`, {
                waitUntil: 'networkidle2',
                timeout: this.TIMEOUT,
            });

            // Check if we reached the connectToFoundry page or an error page
            const headerContent = await this.page.$eval('header#main-header', (el) => el.textContent?.trim());
            if (headerContent === 'Critical Failure!') {
                const details = await this.page.$eval('.error-details p', (el) => el.textContent?.trim());
                throw new FoundryError(details, 'LOGIN_FAILURE');
            }

            this.logger.log(`Successfully reached foundry login page`);
            this.status = FoundryStatus.CONNECTING;
            // Next step of login will be triggered on console message that confirms the websocket connected
        } catch (e) {
            this.handleFoundryError(e);
        }
    }

    async login() {
        if (!this.page) throw new Error('Connect to foundry first before attempting to call login()');
        await sleep(1000);
        try {
            // Enter username and password (replace with your actual credentials)
            for (let attempt = 1; attempt <= 10; attempt++) {
                try {
                    await this.page.select('select[name="userid"]', dotEnv.FOUNDRY_USER);
                    break;
                } catch (e) {
                    this.logger.warn(`Attempt ${attempt} to select user failed: ${e}`);
                    if (attempt >= 10) {
                        console.log(await this.page.content());
                        throw new HttpException(`Unable to select user: ${e}`, HttpStatus.SERVICE_UNAVAILABLE);
                    } else await sleep(1000);
                }
            }

            await this.page.select('select[name="userid"]', dotEnv.FOUNDRY_USER);
            await this.page.type('[name="password"]', dotEnv.FOUNDRY_PASS);
            this.logger.log(`Attempting foundry game login...`);
            // Click the connectToFoundry button
            await this.page.click('button[name="join"]');

            // Wait for navigation to the main page after connectToFoundry
            await this.page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: this.TIMEOUT,
            });
            this.logger.log(`Game page navigation finished`);

            this.status = FoundryStatus.LOADING;
        } catch (e) {
            this.handleFoundryError(e);
        }
    }
}
