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
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { ResponseData } from '../../common/global/globalClass';
import { HttpMessage } from '../../common/global/globalEnum';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  async create(@Body() dto: CreatePostDto) {
    try {
      return new ResponseData(await this.postService.create(dto), HttpStatus.CREATED, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
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
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    console.log(id);
    console.log(dto);
    try {
      return new ResponseData(await this.postService.update(id, dto), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      return new ResponseData(await this.postService.remove(id), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
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
