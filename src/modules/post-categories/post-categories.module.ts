import { Module } from '@nestjs/common';
import { PostCategoryService } from './post-categories.service';
import { PostCategoryController } from './post-categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostCategoryController],
  providers: [PostCategoryService],
})
export class PostCategoriesModule { }
