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
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { ResponseData } from '../../common/global/globalClass';
import { HttpMessage } from '../../common/global/globalEnum';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(@Body() dto: CreatePostDto) {
    try{
      return new ResponseData(await this.postService.create(dto), HttpStatus.CREATED, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query() query: QueryPostDto) {
    try{
      return new ResponseData(await this.postService.findAll(query), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    try{
      return new ResponseData(await this.postService.findOne(idOrSlug), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    try{
      return new ResponseData(await this.postService.update(id, dto), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try{
      return new ResponseData(await this.postService.remove(id), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string) {
    try{
      return new ResponseData(await this.postService.publish(id), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Post(':id/draft')
  async draft(@Param('id') id: string) {
    try{
      return new ResponseData(await this.postService.draft(id), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }
}
