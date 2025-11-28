import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';

// src/post-category/post-category.service.ts
@Injectable()
export class PostCategoryService {
  constructor(private prisma: PrismaClient) { }

  async create(dto: CreatePostCategoryDto) {
    try{
      return await this.prisma.category.create({ data: dto });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAll() {
    try{
      const data = await this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { posts: true } } },
      });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOne(idOrSlug: string) {
    try{
      return await this.prisma.category.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        posts: {
          where: { status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
        },
      },
    });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(id: string, dto: any) {
    try{
      return await this.prisma.category.update({ where: { id }, data: dto });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async remove(id: string) {
    try{
      return await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
