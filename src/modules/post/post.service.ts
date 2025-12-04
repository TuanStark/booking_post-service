// src/post/post.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { Post, PostStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { ExternalService } from 'src/common/external/external.service';
import { UploadService } from 'src/utils/uploads.service';
import { generateUniqueSlug } from 'src/utils/generate-slug';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaClient,
    private readonly externalService: ExternalService,
    private readonly uploadService: UploadService,
  ) { }

  async create(dto: CreatePostDto, file?: Express.Multer.File, userId?: string) {
    const slug = await generateUniqueSlug(dto.title, this.prisma);

    let thumbnailUrl = '';
    let thumbnailPublicId = '';
    if (file) {
      const { imageUrl, imagePublicId } = await this.uploadService.uploadImage(file);
      thumbnailUrl = imageUrl;
      thumbnailPublicId = imagePublicId;
    }

    return this.prisma.post.create({
      data: {
        ...dto,
        status: dto.status || PostStatus.DRAFT,
        publishedAt: dto.status === PostStatus.PUBLISHED ? new Date() : null,
        authorId: userId || '1',
        thumbnailUrl,
        thumbnailPublicId,
        slug,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async findAll(query: QueryPostDto, token?: string) {
    const { sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    if (page < 1 || limit < 1) {
      throw new Error('Page and limit must be greater than 0');
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const where: any = {};

    if (query.search) {
      const searchCap =
        query.search.charAt(0).toUpperCase() + query.search.slice(1);

      where.OR = [
        { title: { contains: searchCap } },
        { content: { contains: searchCap } },
      ];
    }

    // Category filter — FIXED HERE
    if (query.categorySlug) {
      where.category = {
        slug: query.categorySlug,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    const orderBy = { [sortBy]: sortOrder };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),

      this.prisma.post.count({ where }),
    ]);

    const postsWithUser = await this.enrichPostsWithUserData(posts, token);

    return {
      data: postsWithUser,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(idOrSlug: string) {
    const post = await this.prisma.post.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    return {
      data: post,
    };
  }

  async findRelated(params: {
    categorySlug?: string;
    excludeId?: string;
    limit: number;
  }): Promise<{ data: Post[] }> {

    const { categorySlug, excludeId, limit } = params;

    const posts = await this.prisma.post.findMany({
      where: {
        category: {
          slug: categorySlug,
        },
        id: {
          not: excludeId,
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: posts,
    };
  }


  async update(id: string, dto: UpdatePostDto, file?: Express.Multer.File, userId?: string) {
    // Validate slug có bị trùng hay không
    if (dto.slug) {
      const exists = await this.prisma.post.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (exists) throw new ConflictException('Slug đã được sử dụng');
    }

    if (file) {
      const { imageUrl, imagePublicId } = await this.uploadService.uploadImage(file);
      dto.thumbnailUrl = imageUrl;
      dto.thumbnailPublicId = imagePublicId;
    }

    // Tách categoryId ra khỏi dto
    const { categoryId, ...rest } = dto;

    return this.prisma.post.update({
      where: { id },
      data: {
        ...rest,
        authorId: userId,

        publishedAt:
          dto.status === PostStatus.PUBLISHED
            ? new Date()
            : dto.status === PostStatus.DRAFT
              ? null
              : undefined,

        // connect category theo categoryId
        ...(categoryId && {
          category: {
            connect: { id: categoryId },
          },
        }),
      },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // check tồn tại
    await this.prisma.post.delete({ where: { id } });
    return { message: 'Deleted successfully' };
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

  private async enrichPostsWithUserData(
    payments: any[],
    token?: string,
  ): Promise<any[]> {
    if (payments.length === 0) {
      return payments;
    }

    // Collect tất cả userId
    const userIds: string[] = [];
    payments.forEach((payment) => {
      if (payment.userId && !userIds.includes(payment.userId)) {
        userIds.push(payment.userId);
      }
    });

    // Fetch users parallel (tối ưu performance)
    const usersMap = await this.externalService.getUsersByIds(userIds, token);

    // Map user data vào payments
    return payments.map((payment) => ({
      ...payment,
      user: usersMap.get(payment.userId) || null,
    }));
  }
}
