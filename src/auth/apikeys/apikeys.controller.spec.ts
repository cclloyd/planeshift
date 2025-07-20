import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysController } from './apikeys.controller.js';
import { ApiKeysService } from './apikeys.service.js';

describe('ApiKeysController', () => {
    let controller: ApiKeysController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApiKeysController],
            providers: [ApiKeysService],
        }).compile();

        controller = module.get<ApiKeysController>(ApiKeysController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
