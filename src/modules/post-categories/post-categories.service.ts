import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { generateUniqueSlug } from 'src/utils/generate-slug';
import { FindAllDto } from 'src/common/global/find-all.dto';

// src/post-category/post-category.service.ts
@Injectable()
export class PostCategoryService {
  constructor(private prisma: PrismaClient) { }

  async create(dto: CreatePostCategoryDto) {
    const slug = await generateUniqueSlug(dto.name, this.prisma);

    try {
      return await this.prisma.category.create({ data: { ...dto, slug } });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAll(query: FindAllDto) {
    const {
      page = 1,
      limit = 3,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (pageNumber < 1 || limitNumber < 1) {
      throw new Error('Page and limit must be greater than 0');
    }

    const take = limitNumber;
    const skip = (pageNumber - 1) * take;
    const orderBy = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        orderBy,
        skip,
        take,
      }),
      this.prisma.category.count(),
    ]);

    return {
      data: data,
      meta: {
        total,
        pageNumber,
        limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(idOrSlug: string) {
    try {
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
    try {
      return await this.prisma.category.update({ where: { id }, data: dto });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
