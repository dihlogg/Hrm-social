import { Test, TestingModule } from '@nestjs/testing';
import { ReactionCountService } from './reaction-count.service';

describe('ReactionCountService', () => {
  let service: ReactionCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReactionCountService],
    }).compile();

    service = module.get<ReactionCountService>(ReactionCountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
