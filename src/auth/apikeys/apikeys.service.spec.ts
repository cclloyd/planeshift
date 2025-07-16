import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysService } from './apikeys.service.js';

describe('ApiKeysService', () => {
    let service: ApiKeysService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ApiKeysService],
        }).compile();

        service = module.get<ApiKeysService>(ApiKeysService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
