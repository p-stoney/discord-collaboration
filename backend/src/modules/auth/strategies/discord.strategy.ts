import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile as DiscordProfile } from 'passport-discord';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';
import { UserDocument } from '../../user/schemas/user.schema';
import { encrypt } from '../../../utils/encrypt';
import { AuthUserDto } from '../../user/dtos';

/**
 * Discord authentication strategy using Passport.js.
 */
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  /**
   * Initializes the Discord strategy with client credentials and callback URL.
   * @param configService - The configuration service to access environment variables.
   * @param authService - The authentication service for user validation.
   */
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

  /**
   * Overrides the `authenticate` method to include the state parameter in the OAuth flow.
   * @param req - The current request.
   * @param options - Optional parameters.
   */
  authenticate(req: Request, options?: any) {
    options = options || {};
    options.state = req.session.state;
    super.authenticate(req, options);
  }

  /**
   * Validates the user by checking the Discord profile and tokens.
   * @param req - The current request.
   * @param accessToken - The access token from Discord.
   * @param refreshToken - The refresh token from Discord.
   * @param profile - The user's Discord profile.
   * @returns The validated user document.
   * @throws `UnauthorizedException` if validation fails.
   */
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
