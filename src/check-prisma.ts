// src/check-prisma.ts (hoặc src/prisma/client.ts)
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; // Adapter cho PostgreSQL
import 'dotenv/config'; // Load .env

// Tạo adapter với DATABASE_URL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, // Bắt buộc
});

// Singleton
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    adapter, // THÊM DÒNG NÀY LÀ HẾT LỖI
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

async function checkPrisma() {
  console.log('Prisma 7 Connection Test (with Adapter)');
  console.log('='.repeat(50));

  try {
    await prisma.$connect();
    console.log('Kết nối PostgreSQL: OK (Rust-free mode)');

    const [catCount, postCount, publishedCount] = await prisma.$transaction([
      prisma.category.count(),
      prisma.post.count(),
      prisma.post.count({ where: { status: 'PUBLISHED' } }), // Enum mapped
    ]);

    console.log(`Categories : ${catCount}`);
    console.log(`Posts total: ${postCount}`);
    console.log(`Published  : ${publishedCount}`);

    // Test tạo dữ liệu (giữ nguyên như cũ)
    const testCat = await prisma.category.upsert({
      where: { slug: 'prisma-check-temp' },
      update: {},
      create: {
        name: 'Prisma Check Temp',
        slug: 'prisma-check-temp',
        description: 'Tạo tự động bởi check-prisma.ts',
      },
    });

    const testPost = await prisma.post.create({
      data: {
        title: `Check Prisma thành công – ${new Date().toLocaleString('vi-VN')}`,
        slug: `check-${Date.now()}`,
        content: 'Prisma 7 đang chạy cực mượt với adapter!',
        summary: 'Test script chạy ngon lành',
        status: 'PUBLISHED', // Hoặc PostStatus.PUBLISHED nếu mapped
        publishedAt: new Date(),
        categoryId: testCat.id,
        authorId: 'check-script',
      },
    });

    console.log(`Tạo bài viết test: ${testPost.title}`);

    // Dọn dẹp
    await prisma.post.deleteMany({ where: { authorId: 'check-script' } });
    await prisma.category.deleteMany({ where: { slug: 'prisma-check-temp' } });

    console.log('Dọn dẹp dữ liệu test: OK');
    console.log('\nPrisma 7 + Adapter HOẠT ĐỘNG HOÀN HẢO 100%');
    console.log('Rust-free mode: Nhanh hơn, không cần binary engine');
  } catch (error: any) {
    console.error('\nLỗi rồi:', error.message);
    if (error.code === 'P1001')
      console.error('Kiểm tra DATABASE_URL trong .env');
  } finally {
    await prisma.$disconnect();
    console.log('\nĐã đóng kết nối. Bye!');
  }
}

checkPrisma();
