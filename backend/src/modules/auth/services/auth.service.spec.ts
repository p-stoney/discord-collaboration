import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/services/user.service';
import { UserDocument } from '../../user/schemas/user.schema';
import { AuthUserDto, UserDto } from '../../user/dtos';
import { Profile } from 'passport-discord';
import { mockUsers } from '../../user/__mocks__/user.mocks';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  const mockUserService = {
    upsert: jest.fn(),
    findByDiscordId: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should upsert user and return user document', async () => {
      const profile = {
        id: '123456789012345678',
        username: 'TestUser',
        discriminator: '1234',
        avatar: 'avatarHash',
        email: 'test@example.com',
      } as Profile;
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';

      const authUserDto: AuthUserDto = {
        profile,
        accessToken,
        refreshToken,
      };

      const userDto: UserDto = {
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar,
        email: profile.email,
        accessToken,
        refreshToken,
      };

      const expectedUser: UserDocument = {
        ...userDto,
      } as UserDocument;

      mockUserService.upsert.mockResolvedValueOnce(expectedUser);

      const result = await service.validateUser(authUserDto);

      expect(result).toBe(expectedUser);
      expect(userService.upsert).toHaveBeenCalledWith(userDto);
    });
  });

  describe('findByDiscordId', () => {
    it('should return user when found', async () => {
      const discordId = '123456789012345678';
      const expectedUser: UserDocument = mockUsers[0];

      mockUserService.findByDiscordId.mockResolvedValueOnce(expectedUser);

      const result = await service.findByDiscordId(discordId);

      expect(result).toBe(expectedUser);
      expect(userService.findByDiscordId).toHaveBeenCalledWith(discordId);
    });

    it('should return null when user not found', async () => {
      const discordId = 'nonexistent';

      mockUserService.findByDiscordId.mockResolvedValueOnce(null);

      const result = await service.findByDiscordId(discordId);

      expect(result).toBeNull();
      expect(userService.findByDiscordId).toHaveBeenCalledWith(discordId);
    });
  });
});
