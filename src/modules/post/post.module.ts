import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ExternalModule } from 'src/common/external/external.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ExternalModule, HttpModule, PrismaModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule { }
