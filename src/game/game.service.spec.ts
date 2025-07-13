import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service.js';

describe('ActorsService', () => {
    let service: GameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
