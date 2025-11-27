import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostCategoriesModule } from './modules/post-categories/post-categories.module';
import { PostModule } from './modules/post/post.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PostCategoriesModule, PostModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
