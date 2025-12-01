import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { PostCategoryService } from './post-categories.service';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { ResponseData } from '../../common/global/globalClass';
import { HttpMessage } from '../../common/global/globalEnum';

import { FindAllDto } from 'src/common/global/find-all.dto';
// src/post-category/post-category.controller.ts
@Controller('post-categories')
export class PostCategoryController {
  constructor(private readonly service: PostCategoryService) { }

  @Post()
  async create(@Body() dto: CreatePostCategoryDto) {
    try {
      return new ResponseData(await this.service.create(dto), HttpStatus.CREATED, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query() query: FindAllDto) {
    try {
      return new ResponseData(await this.service.findAll(query), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    try {
      return new ResponseData(await this.service.findOne(idOrSlug), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  // ... update, delete tương tự
}
