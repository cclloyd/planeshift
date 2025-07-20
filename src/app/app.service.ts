import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FoundryService } from '../foundry/foundry.service.js';
import { FoundryStatus } from '../foundry/types.js';

@Injectable()
export class AppService {
    constructor(private readonly foundry: FoundryService) {}

    getHealth() {
        const status = { status: this.foundry.statusText, message: this.foundry.error?.message ?? 'healthy' };
        if (this.foundry.status === FoundryStatus.RUNNING) return status;
        throw new HttpException(status, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
