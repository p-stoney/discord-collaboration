import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile as DiscordProfile } from 'passport-discord';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';
import { UserDocument } from '../../user/schemas/user.schema';
import { encrypt } from '../../../utils/encrypt';
import { AuthUserDto } from '../../user/dtos';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.get<string>('auth.discordClientId'),
      clientSecret: configService.get<string>('auth.discordClientSecret'),
      callbackURL: configService.get<string>('auth.discordCallbackUrl'),
      scope: ['identify', 'email'],
      passReqToCallback: true,
    });
  }

  authenticate(req: Request, options?: any) {
    options = options || {};
    options.state = req.session.state;
    super.authenticate(req, options);
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: DiscordProfile
  ): Promise<UserDocument> {
    const tokenSecret = this.configService.get<string>('SECRET_PASSPHRASE');
    const encryptedAccessToken = encrypt(accessToken, tokenSecret);
    const encryptedRefreshToken = encrypt(refreshToken, tokenSecret);

    const authUserDto: AuthUserDto = {
      profile,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    };

    const user = await this.authService.validateUser(authUserDto);

    if (!user) {
      throw new UnauthorizedException('User validation failed');
    }

    return user;
  }
}
