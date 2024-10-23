import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './services/auth.service';
import { DiscordStrategy } from './strategies/discord.strategy';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './serializers/session.serializer';

@Module({
  imports: [
    PassportModule.register({
      session: true,
    }),
    UserModule,
  ],
  providers: [AuthService, DiscordStrategy, SessionSerializer],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
