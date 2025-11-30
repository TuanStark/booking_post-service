import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ExternalModule } from 'src/common/external/external.module';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express/multer';
import { memoryStorage } from 'multer';
import { UploadService } from 'src/utils/uploads.service';
@Module({
  imports: [
    ExternalModule,
    HttpModule,
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  ],
  controllers: [PostController],
  providers: [PostService, UploadService],
  exports: [PostService],
})
export class PostModule { }
