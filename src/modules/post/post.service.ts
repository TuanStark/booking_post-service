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
    // const exists = await this.prisma.post.findUnique({
    //   where: { id: dto.id },
    // });
    // if (exists) throw new ConflictException('ID đã tồn tại');

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

    const datawithUser = await this.enrichPostsWithUserData(data, token);

    return {
      data: datawithUser,
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
    // Validate slug có bị trùng hay không
    if (dto.slug) {
      const exists = await this.prisma.post.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (exists) throw new ConflictException('Slug đã được sử dụng');
    }

    // Tách categoryId ra khỏi dto
    const { categoryId, ...rest } = dto;

    return this.prisma.post.update({
      where: { id },
      data: {
        ...rest,

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
