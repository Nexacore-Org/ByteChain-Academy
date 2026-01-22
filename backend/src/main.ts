import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
}
bootstrap();
