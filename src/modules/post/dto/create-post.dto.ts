import { PostStatus } from '../enum/enum';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  // @IsUUID()
  categoryId: string;

  // @IsString()
  authorId: string;

  @IsString()
  thumbnailPublicId?: string;
}
