import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PostCategoryService } from './post-categories.service';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';

// src/post-category/post-category.controller.ts
@Controller('post-categories')
export class PostCategoryController {
  constructor(private readonly service: PostCategoryService) { }

  @Post()
  create(@Body() dto: CreatePostCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.service.findOne(idOrSlug);
  }

  // ... update, delete tương tự
}
