import { HttpException, HttpStatus, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Browser, ConsoleMessage, EvaluateFunc, Page, TimeoutError } from 'puppeteer';
import { sleep } from '../util.js';
import { FoundryStatus } from './types.js';
import { dotEnv } from '../env.js';
import { paginateRaw } from './util.js';

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
        page.on('framenavigated', (frame) => {
            if (frame === page.mainFrame()) {
                this.logger.log(`ℹ️ Browser navigation: ${frame.url()}`);
            }
        });

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

        // Actually log the output
        if (this.logOutput) {
            const prefix = `[fvtt] `;
            const lines = msg.text().split('\n');
            for (const line of lines) {
                this.logger.log(`${prefix}${line}`);
            }
        }

        // Handle various events from the browser javascript console
        if (msg.text().endsWith('Fonts loaded and ready.')) {
            if (this.page!.url().endsWith('/setup')) void this.launchGame();
        }
        if (msg.text().includes('Foundry VTT | Connected to server socket using session')) {
            if (this.page!.url().endsWith('/join')) void this.loginToGame();
            // if (this.page!.url().endsWith('/setup')) void this.launchGame();
            // TODO: See if this trigger can be used on the other page to detect when fully loaded, or when `game` is populated at least.
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
        if (msg.text().includes('Foundry VTT | Prepared World Documents in')) {
            this.status = FoundryStatus.RUNNING;
            this._loadEnd = new Date();
            this.loadTime = this._loadEnd.getTime() - this._loadStart!.getTime();
            this.logger.log(`✅  FoundryVTT logged in to game in ${this.loadTime / 1000}s.`);
            this.registerHelperFunctions().then();
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

    async registerHelperFunctions() {
        const fnString = paginateRaw.toString();
        await this.page!.evaluate((serializedFn: string) => {
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            window.paginateRaw = eval(`(${serializedFn})`);
        }, fnString);
    }

    async selectByVisibleText(selector: string, text: string) {
        await this.page!.evaluate(
            (selector, text) => {
                const select = document.querySelector(selector) as HTMLSelectElement;
                if (!select) return;
                const option = Array.from(select.options).find((opt) => opt.text.trim() === text);
                if (option) {
                    select.value = option.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }
            },
            selector,
            text,
        );
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

            // Navigate to the Foundry VTT login page
            await this.page.goto(`${this.url}/auth`, {
                waitUntil: 'networkidle2',
                timeout: this.TIMEOUT,
            });

            // If we actually reached /auth, there is no game active and we need to try and login as admin.
            if (this.page.url().endsWith('/auth')) {
                await this.loginAdmin();
            }

            // Check if we reached the login page or an error page
            const headerContent = await this.page.$eval('header#main-header', (el) => el.textContent?.trim());
            if (headerContent === 'Critical Failure!') {
                const details = await this.page.$eval('.error-details p', (el) => el.textContent?.trim());
                throw new FoundryError(details, 'LOGIN_FAILURE');
            }

            this.status = FoundryStatus.CONNECTING;
            // Next step of login will be triggered on console message that confirms the websocket connected
        } catch (e) {
            this.handleFoundryError(e);
        }
    }

    async loginAdmin() {
        if (!dotEnv.FOUNDRY_ADMIN_PASS) throw new FoundryError('No active game session and FOUNDRY_ADMIN_PASS not provided or invalid.', 'LOGIN_FAILURE');
        if (!dotEnv.FOUNDRY_WORLD) throw new FoundryError('No active game session and FOUNDRY_WORLD not provided.', 'LOGIN_FAILURE');
        const page = this.page!;

        this.logger.log(`Attempting to sign in to admin page...`);
        await page.type('[name="adminPassword"]', dotEnv.FOUNDRY_PASS);
        await page.click('button[name="action"]');
        await page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: this.TIMEOUT,
        });
        this.logger.log(`Management page navigation finished`);
    }

    async launchGame() {
        const page = this.page!;
        this.logger.log(`Attempting to launch game ${dotEnv.FOUNDRY_WORLD}...`);
        await sleep(3000); // TODO: Fix to remove sleep
        console.log('click');
        // const world = await page.$(`li[data-package-id="${dotEnv.FOUNDRY_WORLD}"]`);
        // if (!world) throw new FoundryError('No active game session and unable to login to the specified default game (unable to find world).', 'LOGIN_FAILURE');
        // const elem = await page.$(`li[data-package-id="${dotEnv.FOUNDRY_WORLD}"] i.fa-play-circle`);
        // await page.waitForSelector(`li[data-package-id="${dotEnv.FOUNDRY_WORLD}"] i.fa-play-circle`, { visible: true, timeout: this.TIMEOUT });
        // await elem!.click();
        await page.click(`li[data-package-id="${dotEnv.FOUNDRY_WORLD}"] i.fa-play-circle`);

        // await page.waitForNavigation({
        //     waitUntil: 'networkidle2',
        //     timeout: this.TIMEOUT,
        // });
        // TODO: trigger loginToGame when url changes to /join
        //return await this.loginToGame();
        //throw new FoundryError('No active game session and unable to login to the specified default game. asdf', 'LOGIN_FAILURE');
    }

    async loginToGame() {
        if (!this.page) throw new Error('Connect to foundry first before attempting to call login');
        console.log('Attempting foundry game login...');
        await sleep(1000);
        // Loop around for a few seconds to try and do it as soon as it loads, but not to wait unnecessarily long.
        try {
            // Enter username and password (replace with your actual credentials)
            for (let attempt = 1; attempt <= 10; attempt++) {
                try {
                    await this.selectByVisibleText('select[name="userid"]', 'APIUser');
                    break;
                } catch (e) {
                    this.logger.warn(`Attempt ${attempt} to select user failed: ${e}`);
                    if (attempt >= 10) {
                        console.log(await this.page.content());
                        throw new HttpException(`Unable to select user: ${e}`, HttpStatus.SERVICE_UNAVAILABLE);
                    } else await sleep(1000);
                }
            }

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
