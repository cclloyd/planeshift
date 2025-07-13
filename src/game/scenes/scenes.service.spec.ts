import { Test, TestingModule } from '@nestjs/testing';
import { ScenesService } from './scenes.service';

describe('ScenesService', () => {
    let service: ScenesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ScenesService],
        }).compile();

        service = module.get<ScenesService>(ScenesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
