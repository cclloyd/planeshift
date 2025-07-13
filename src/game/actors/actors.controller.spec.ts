import { Test, TestingModule } from '@nestjs/testing';
import { ActorsController } from './actors.controller.js';
import { ActorsService } from './actors.service.js';

describe('ActorsController', () => {
    let controller: ActorsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ActorsController],
            providers: [ActorsService],
        }).compile();

        controller = module.get<ActorsController>(ActorsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
