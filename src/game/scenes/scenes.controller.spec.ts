import { Test, TestingModule } from '@nestjs/testing';
import { ScenesController } from './scenes.controller.js';
import { ScenesService } from './scenes.service.js';

describe('ScenesController', () => {
    let controller: ScenesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ScenesController],
            providers: [ScenesService],
        }).compile();

        controller = module.get<ScenesController>(ScenesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
