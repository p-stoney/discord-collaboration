import { Test, TestingModule } from '@nestjs/testing';
import { DiscordStrategy } from './discord.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserDocument } from '../../user/schemas/user.schema';
import { AuthUserDto } from '../../user/dtos';
import { Profile } from 'passport-discord';
import { encrypt } from '../../../utils/encrypt';

jest.mock('../../../utils/encrypt', () => ({
  encrypt: jest.fn().mockImplementation((token) => `encrypted(${token})`),
}));

describe('DiscordStrategy', () => {
  let strategy: DiscordStrategy;
  let configService: ConfigService;
  let authService: AuthService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'auth.discordClientId': 'test-client-id',
        'auth.discordClientSecret': 'test-client-secret',
        'auth.discordCallbackUrl': 'http://localhost/auth/callback',
        SECRET_PASSPHRASE: 'secret',
      };
      return config[key];
    }),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = moduleRef.get<DiscordStrategy>(DiscordStrategy);
    configService = moduleRef.get<ConfigService>(ConfigService);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate user and return user document', async () => {
      const req = {} as Request;
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      const profile = {
        id: '123456789012345678',
        username: 'TestUser',
        discriminator: '1234',
        avatar: 'avatarHash',
        email: 'test@example.com',
      } as Profile;

      const tokenSecret = 'secret';
      mockConfigService.get.mockReturnValue(tokenSecret);

      const encryptedAccessToken = `encrypted(${accessToken})`;
      const encryptedRefreshToken = `encrypted(${refreshToken})`;

      const authUserDto: AuthUserDto = {
        profile,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      };

      const expectedUser: UserDocument = {
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar,
        email: profile.email,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      } as UserDocument;

      mockAuthService.validateUser.mockResolvedValueOnce(expectedUser);

      const result = await strategy.validate(
        req,
        accessToken,
        refreshToken,
        profile as any
      );

      expect(result).toBe(expectedUser);
      expect(configService.get).toHaveBeenCalledWith('SECRET_PASSPHRASE');
      expect(encrypt).toHaveBeenCalledWith(accessToken, tokenSecret);
      expect(encrypt).toHaveBeenCalledWith(refreshToken, tokenSecret);
      expect(authService.validateUser).toHaveBeenCalledWith(authUserDto);
    });

    it('should throw UnauthorizedException if user validation fails', async () => {
      const req = {} as Request;
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      const profile = {
        id: '123456789012345678',
        username: 'TestUser',
        discriminator: '1234',
        avatar: 'avatarHash',
        email: 'test@example.com',
      };

      const tokenSecret = 'secret';
      mockConfigService.get.mockReturnValue(tokenSecret);

      mockAuthService.validateUser.mockResolvedValueOnce(null);

      await expect(
        strategy.validate(req, accessToken, refreshToken, profile as any)
      ).rejects.toThrow(UnauthorizedException);

      expect(authService.validateUser).toHaveBeenCalled();
    });
  });
});
