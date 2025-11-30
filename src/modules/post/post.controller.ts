// src/post/post.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { ResponseData } from '../../common/global/globalClass';
import { HttpMessage } from '../../common/global/globalEnum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    try {
      // Extract userId from x-user-id header sent by API Gateway
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        throw new Error('User ID is required');
      }
      if (!file) {
        throw new BadRequestException('file is required');
      }
      const post = await this.postService.create(
        createPostDto,
        file,
        userId,
      );
      return new ResponseData(
        post,
        HttpStatus.ACCEPTED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData(
        null,
        HttpStatus.NOT_FOUND,
        HttpMessage.NOT_FOUND,
      );
    }
  }

  @Get()
  async findAll(@Query() query: QueryPostDto, @Req() req: Request) {
    try {
      // Lấy token từ request header (từ API Gateway forward xuống)
      const authHeader = req.headers['authorization'] as string;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

      const posts = await this.postService.findAll(query, token);
      return new ResponseData(
        posts,
        HttpStatus.OK,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    try {
      return new ResponseData(await this.postService.findOne(idOrSlug), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    console.log(id);
    console.log(dto);
    // Extract userId from x-user-id header sent by API Gateway
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!file) {
      throw new BadRequestException('file is required');
    }
    try {
      return new ResponseData(await this.postService.update(id, dto, file, userId), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.postService.remove(id);
    } catch (error) {
      throw new HttpException(HttpMessage.SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Post(':id/publish')
  async publish(@Param('id') id: string) {
    try {
      return new ResponseData(await this.postService.publish(id), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Post(':id/draft')
  async draft(@Param('id') id: string) {
    try {
      return new ResponseData(await this.postService.draft(id), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }
}
