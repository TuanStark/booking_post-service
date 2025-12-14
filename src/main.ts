import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3010;
  await app.listen(port);

  console.log(`Post service is running on: ${port}`);
}
bootstrap();
