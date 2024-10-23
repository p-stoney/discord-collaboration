import { RegisterCommand } from './register.command';
import { ConfigService } from '@nestjs/config';
import { CommandInteraction, User } from 'discord.js';
import { randomBytes } from 'crypto';

jest.mock('crypto');

describe('RegisterCommand', () => {
  let command: RegisterCommand;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockInteraction = {
    user: {
      id: '123456789012345678',
    } as User,
    reply: jest.fn(),
  } as unknown as CommandInteraction;

  beforeEach(() => {
    configService = mockConfigService as unknown as ConfigService;
    command = new RegisterCommand(configService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onRegister', () => {
    it('should send a registration link to the user', async () => {
      const discordId = mockInteraction.user.id;
      const randomValue = 'abcdef1234567890';
      const state = `${discordId}:${randomValue}`;
      const baseUrl = 'http://localhost:3000';

      (randomBytes as jest.Mock).mockReturnValue(
        Buffer.from(randomValue, 'hex')
      );

      mockConfigService.get.mockReturnValue(baseUrl);

      await command.onRegister(mockInteraction);

      const expectedRegistrationUrl = `${baseUrl}/auth/discord/start?state=${state}`;

      expect(randomBytes).toHaveBeenCalledWith(16);
      expect(configService.get).toHaveBeenCalledWith('auth.appBaseUrl');
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `Please click the link below to register your account:\n${expectedRegistrationUrl}`,
        ephemeral: true,
      });
    });
  });
});
