import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { PostCategoryService } from './post-categories.service';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { ResponseData } from '../../common/global/globalClass';
import { HttpMessage } from '../../common/global/globalEnum';

// src/post-category/post-category.controller.ts
@Controller('post-categories')
export class PostCategoryController {
  constructor(private readonly service: PostCategoryService) { }

  @Post()
  create(@Body() dto: CreatePostCategoryDto) {
    try{
      return new ResponseData(this.service.create(dto), HttpStatus.CREATED, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Get()
  findAll() {
    try{
      return new ResponseData(this.service.findAll(), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    try{
      return new ResponseData(this.service.findOne(idOrSlug), HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(null, HttpStatus.INTERNAL_SERVER_ERROR, HttpMessage.SERVER_ERROR);
    }
  }

  // ... update, delete tương tự
}
