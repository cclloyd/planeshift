import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
    constructor(private readonly app: AppService) {}

    @Get('/healthz')
    getHealthStatus() {
        return this.app.getHealth();
    }
}
