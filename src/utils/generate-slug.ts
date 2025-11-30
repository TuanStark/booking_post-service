export function generateSlug(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export async function generateUniqueSlug(title: string, prisma: any) {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Kiểm tra xem slug đã tồn tại trong DB chưa
    while (await prisma.post.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
    }

    return slug;
}
