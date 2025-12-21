
// Category
export interface Category {
    id: string
    name: string
    slug: string
    description: string
    createdAt: Date
    updatedAt: Date
}

// Post (News)
export interface Post {
    id: string
    title: string
    slug: string
    summary: string
    content: string
    thumbnailUrl: string
    thumbnailPublicId: string
    status: PostStatus
    publishedAt: Date
    categoryId: string
    category: Category
    authorId: string
    createdAt: Date
    updatedAt: Date
}

export enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}
