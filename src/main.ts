import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { requireEnv } from './env.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT ?? 3000);
}

requireEnv();

bootstrap();
