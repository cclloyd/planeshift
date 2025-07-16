import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { dotEnv, requireEnv } from './env.js';
import session from 'express-session';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(
        session({
            secret: dotEnv.SECRET_KEY,
            resave: false, // Prevents saving of unchanged sessions
            saveUninitialized: false, // Prevents saving of empty sessions
            cookie: {
                httpOnly: true,
                secure: false, // Set to true if using HTTPS
                maxAge: 1_000 * 60 * 60, // 1 hour for session expiration
            },
        }),
    );
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 3000);
}

requireEnv();

bootstrap();
