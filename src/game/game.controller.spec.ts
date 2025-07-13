import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller.js';
import { GameService } from './game.service.js';

describe('ActorsController', () => {
    let controller: GameController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [GameService],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
