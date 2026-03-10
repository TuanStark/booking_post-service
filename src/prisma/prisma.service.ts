// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { prisma } from './client';

@Injectable()
export class PrismaService implements OnModuleInit {
  async onModuleInit() {
    await prisma.$connect();
  }

  // Optional: graceful shutdown
  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
