import { Test, TestingModule } from '@nestjs/testing';
import { ReactionCountController } from './reaction-count.controller';
import { ReactionCountService } from './reaction-count.service';

describe('ReactionCountController', () => {
  let controller: ReactionCountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactionCountController],
      providers: [ReactionCountService],
    }).compile();

    controller = module.get<ReactionCountController>(ReactionCountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
