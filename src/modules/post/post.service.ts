// src/post/post.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
// import { PrismaService } from '@/prisma/prisma.service'; // sẽ tạo ngay dưới
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { Post, PostStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaClient) { }

  async create(dto: CreatePostDto) {
    const exists = await this.prisma.post.findUnique({
      where: { slug: dto.slug },
    });
    if (exists) throw new ConflictException('Slug đã tồn tại');

    return this.prisma.post.create({
      data: {
        ...dto,
        status: dto.status || PostStatus.DRAFT,
        publishedAt: dto.status === PostStatus.PUBLISHED ? new Date() : null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async findAll(query: QueryPostDto) {
    const { page, limit, status, categorySlug, search } = query;
    const skip = ((page || 1) - 1) * (limit || 10);

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categorySlug) where.category = { slug: categorySlug };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / (limit || 10)),
      },
    };
  }

  async findOne(idOrSlug: string) {
    const post = await this.prisma.post.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    if (dto.slug) {
      const exists = await this.prisma.post.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (exists) throw new ConflictException('Slug đã được sử dụng');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        publishedAt:
          dto.status === PostStatus.PUBLISHED
            ? new Date()
            : dto.status === PostStatus.DRAFT
              ? null
              : undefined,
      },
      include: { category: { select: { name: true, slug: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // check tồn tại
    return this.prisma.post.delete({ where: { id } });
  }

  // Bonus: publish / draft nhanh
  async publish(id: string) {
    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async draft(id: string) {
    return this.prisma.post.update({
      where: { id },
      data: { status: PostStatus.DRAFT, publishedAt: null },
    });
  }
}
