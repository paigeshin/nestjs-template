import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
const cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      keys: [
        'put here series of random numbers or anything you want, encrypted with this key',
      ],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //Remove properties not specified inside Incoming Request
    }),
  );
  await app.listen(3000);
}
bootstrap();
