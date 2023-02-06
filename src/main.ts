import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import DATABASE from 'model';

async function bootstrap() {
  await DATABASE();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(9000);
}
bootstrap();
