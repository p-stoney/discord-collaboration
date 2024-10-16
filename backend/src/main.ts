import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getEnvVariable } from './utils/getEnvVariable';
import { Environment } from './config/env.validation';
import { getConnectionToken } from '@nestjs/mongoose';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { Connection } from 'mongoose';
import { ValidationPipe } from '@nestjs/common';
import { AuthExceptionFilter, HttpExceptionFilter } from './filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  const configService = app.get(ConfigService);

  const sessionSecret = getEnvVariable(configService, 'SESSION_SECRET');
  const port = parseInt(getEnvVariable(configService, 'PORT'), 10);
  const nodeEnv = getEnvVariable(configService, 'NODE_ENV') as Environment;

  const mongooseConnection = app.get<Connection>(getConnectionToken());

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongooseConnection.getClient(),
        stringify: false,
        autoRemove: 'interval',
        autoRemoveInterval: 10,
      }),
      cookie: {
        secure: nodeEnv === Environment.Production,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7200000,
      },
    })
  );

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

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
