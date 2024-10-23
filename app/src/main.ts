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
import { RedisClientType } from 'redis';

async function bootstrap() {
  let app: NestExpressApplication;

  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      snapshot: true,
    });
    console.log('Nest application created successfully.');
  } catch (error) {
    console.error('Error creating Nest application:', error.message);
    process.exit(1);
  }

  const configService = app.get(ConfigService);

  const sessionSecret = getEnvVariable(configService, 'SESSION_SECRET');
  const port = parseInt(getEnvVariable(configService, 'PORT'), 10);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  let redisClient: RedisClientType;

  try {
    redisClient = createClient({ url: 'redis://localhost:6379' });
    await redisClient.connect();
    console.log('Connected to Redis successfully.');
  } catch (error) {
    console.error('Error connecting to Redis:', error.message);
    process.exit(1);
  }

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

  let redisIoAdapter: SocketIoAdapter;

  try {
    redisIoAdapter = new SocketIoAdapter(app, sessionMiddleware);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    console.log('WebSocket adapter connected to Redis successfully.');
  } catch (error) {
    console.error(
      'Error connecting WebSocket adapter to Redis:',
      error.message
    );
    process.exit(1);
  }

  // Duplicate line
  app.useWebSocketAdapter(redisIoAdapter);

  try {
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('Error starting the application:', error.message);
    process.exit(1);
  }
}

async function start() {
  try {
    await bootstrap();
  } catch (error) {
    console.error(
      'Unexpected error during application bootstrap:',
      error.message
    );
    process.exit(1);
  }
}

start();
