import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module.js';
import { dotEnv, requireEnv } from './env.js';
import session from 'express-session';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(
        session({
            secret: dotEnv.SECRET_KEY,
            resave: false, // Prevents saving of unchanged sessions
            saveUninitialized: false, // Prevents saving of empty sessions
            cookie: {
                httpOnly: true,
                secure: false, // TODO: set secure conditionally?
                maxAge: 1_000 * 60 * 60, // 1 hour for session expiration
            },
        }),
    );
    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET' && (req.path === '/' || req.path === '/api' || req.path === '/api/')) return res.redirect('/api/swagger/');
        next();
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const config = new DocumentBuilder()
        .setTitle('PlaneShift Schema')
        .setDescription('Full Swagger schema for the FoundryVTT REST API.')
        .setVersion(dotEnv.API_VERSION)
        .addSecurity('tokenAuth', {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Send header as `Authorization: Token <your_access_token>`',
        })
        .build();
    const options = {
        jsonDocumentUrl: 'api/schema',
        swaggerOptions: {
            docExpansion: 'list',
            authAction: {
                tokenAuth: {
                    name: 'Authorization',
                    schema: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'Authorization',
                    },
                    value: 'Token <YOUR_ACCESS_TOKEN>',
                },
            },
        },
    } as SwaggerCustomOptions;

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/swagger', app, documentFactory, options);

    await app.listen(process.env.PORT ?? 3000);
}

requireEnv();

void bootstrap();
