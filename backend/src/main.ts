import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getEnvVariable } from './utils/getEnvVariable';
import session from 'express-session';
import passport from 'passport';
import { ValidationPipe } from '@nestjs/common';
import { AuthExceptionFilter, HttpExceptionFilter } from './filters';
import { SocketIoAdapter } from './adapters/socket-io.adapter';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
  });

  const configService = app.get(ConfigService);

  const sessionSecret = getEnvVariable(configService, 'SESSION_SECRET');
  const port = parseInt(getEnvVariable(configService, 'PORT'), 10);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const redisClient = createClient({ url: 'redis://localhost:6379' });
  await redisClient.connect();

  const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: false,
      maxAge: 7200000,
    },
  });

  app.use(sessionMiddleware);

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalFilters(new AuthExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const redisIoAdapter = new SocketIoAdapter(app, sessionMiddleware);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
