import { IsString, IsOptional } from 'class-validator';

export class CreatePostCategoryDto {
    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;
}
