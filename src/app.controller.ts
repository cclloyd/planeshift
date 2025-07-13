import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { FoundryService } from './foundry/foundry.service.js';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly foundry: FoundryService,
    ) {}

    @Get('/healthz')
    getHealthStatus(): { status: string; message: string } {
        return { status: 'ok', message: 'healthy' };
    }
}
