import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { FoundryService } from './foundry.service.js';

@Module({
    providers: [FoundryService],
    exports: [FoundryService],
})
export class FoundryModule implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly foundryService: FoundryService) {}

    async onModuleInit() {
        // Login, but don't wait for it to finish logging in to finish initializing the API.
        void this.foundryService.login();
    }

    async onModuleDestroy() {
        await this.foundryService.closeBrowser();
    }
}
