import { Test, TestingModule } from '@nestjs/testing';
import { PostCategoriesController } from './post-categories.controller';
import { PostCategoriesService } from './post-categories.service';

describe('PostCategoriesController', () => {
  let controller: PostCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCategoriesController],
      providers: [PostCategoriesService],
    }).compile();

    controller = module.get<PostCategoriesController>(PostCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
