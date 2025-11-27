import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostCategoriesModule } from './modules/post-categories/post-categories.module';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [PostCategoriesModule, PostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
