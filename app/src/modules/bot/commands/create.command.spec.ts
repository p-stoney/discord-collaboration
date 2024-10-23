import { CreateCommand } from './create.command';
import { DocService } from '../../doc/services';
import { CommandInteraction, User, TextChannel, Message } from 'discord.js';

describe('CreateCommand', () => {
  let command: CreateCommand;
  let docService: DocService;

  const mockDocService = {
    create: jest.fn(),
  };

  const mockUser = {
    id: '123456789012345678',
  } as User;

  const mockChannel = {
    awaitMessages: jest.fn(),
  } as unknown as TextChannel;

  const mockInteraction = {
    user: mockUser,
    reply: jest.fn(),
    followUp: jest.fn(),
    channel: mockChannel,
  } as unknown as CommandInteraction;

  beforeEach(() => {
    docService = mockDocService as unknown as DocService;
    command = new CreateCommand(docService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onCreate', () => {
    it('should create a document and send a confirmation message', async () => {
      const userId = mockInteraction.user.id;

      const mockResponseMessage = {
        content: 'Test Document',
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock).mockResolvedValueOnce({
        first: () => mockResponseMessage,
      });

      (docService.create as jest.Mock).mockResolvedValueOnce(null);

      await command.onCreate(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Please enter the title of the document:',
        ephemeral: true,
      });

      expect(mockChannel.awaitMessages).toHaveBeenCalledWith({
        filter: expect.any(Function),
        max: 1,
        time: 30000,
        errors: ['time'],
      });

      expect(docService.create).toHaveBeenCalledWith({
        ownerId: userId,
        title: 'Test Document',
        content: '',
      });

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: 'Document "Test Document" created successfully.',
        ephemeral: true,
      });

      expect(mockResponseMessage.delete).toHaveBeenCalled();
    });

    it('should handle no title provided', async () => {
      const userId = mockInteraction.user.id;

      const mockResponseMessage = {
        content: '',
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock).mockResolvedValueOnce({
        first: () => mockResponseMessage,
      });

      await command.onCreate(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Please enter the title of the document:',
        ephemeral: true,
      });

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: 'No title was provided.',
        ephemeral: true,
      });

      expect(mockResponseMessage.delete).toHaveBeenCalled();

      expect(docService.create).not.toHaveBeenCalled();
    });

    it('should handle user not responding in time', async () => {
      (mockChannel.awaitMessages as jest.Mock).mockRejectedValueOnce({
        message: 'time',
      });

      await command.onCreate(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Please enter the title of the document:',
        ephemeral: true,
      });

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content:
          'You did not provide a title in time (30 seconds). Please try again.',
        ephemeral: true,
      });

      expect(docService.create).not.toHaveBeenCalled();
    });
  });
});
