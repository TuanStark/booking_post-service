// src/post/dto/query-post.dto.ts
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PostStatus } from '../enum/enum';
import { FindAllDto } from 'src/common/global/find-all.dto';
import { PartialType } from '@nestjs/mapped-types';

export class QueryPostDto extends PartialType(FindAllDto) {
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
