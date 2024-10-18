import { Test, TestingModule } from '@nestjs/testing';
import { SessionSerializer, Done } from './session.serializer';
import { AuthService } from '../services/auth.service';
import { UserDocument } from '../../user/schemas/user.schema';
import { mockUsers } from '../../user/__mocks__/user.mocks';

describe('SessionSerializer', () => {
  let serializer: SessionSerializer;
  let authService: AuthService;

  const mockAuthService = {
    findByDiscordId: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SessionSerializer,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    serializer = moduleRef.get<SessionSerializer>(SessionSerializer);
    authService = moduleRef.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(serializer).toBeDefined();
  });

  describe('serializeUser', () => {
    it('should serialize user by discordId', () => {
      const user: UserDocument = mockUsers[0];
      const done: Done<string> = jest.fn();

      serializer.serializeUser(user, done);

      expect(done).toHaveBeenCalledWith(null, user.discordId);
    });
  });

  describe('deserializeUser', () => {
    it('should deserialize user when found', async () => {
      const discordId = '123456789012345678';
      const user: UserDocument = mockUsers[0];
      const done: Done<UserDocument> = jest.fn();

      mockAuthService.findByDiscordId.mockResolvedValueOnce(user);

      await serializer.deserializeUser(discordId, done);

      expect(authService.findByDiscordId).toHaveBeenCalledWith(discordId);
      expect(done).toHaveBeenCalledWith(null, user);
    });

    it('should deserialize to null when user not found', async () => {
      const discordId = 'nonexistent';
      const done: Done<UserDocument> = jest.fn();

      mockAuthService.findByDiscordId.mockResolvedValueOnce(null);

      await serializer.deserializeUser(discordId, done);

      expect(authService.findByDiscordId).toHaveBeenCalledWith(discordId);
      expect(done).toHaveBeenCalledWith(null, null);
    });
  });
});
