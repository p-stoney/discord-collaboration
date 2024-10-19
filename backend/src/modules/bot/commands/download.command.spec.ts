import { DownloadCommand } from './download.command';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import {
  CommandInteraction,
  User,
  TextChannel,
  Message,
  AttachmentBuilder,
} from 'discord.js';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';

describe('DownloadCommand', () => {
  let command: DownloadCommand;
  let docService: DocService;
  let permissionsService: PermissionsService;

  const mockDocService = {
    findByDocId: jest.fn(),
  };

  const mockPermissionsService = {
    hasPermission: jest.fn(),
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
    permissionsService =
      mockPermissionsService as unknown as PermissionsService;
    command = new DownloadCommand(docService, permissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onDownload', () => {
    it('should download the document when the user has permission', async () => {
      const userId = mockInteraction.user.id;
      const docId = 'doc123';
      const document = {
        docId,
        title: 'Test Document',
        content: 'This is a test document.',
      };

      const mockResponseMessage = {
        content: docId,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock).mockResolvedValueOnce({
        first: () => mockResponseMessage,
      });

      (permissionsService.hasPermission as jest.Mock).mockResolvedValueOnce(
        true
      );
      (docService.findByDocId as jest.Mock).mockResolvedValueOnce(document);

      await command.onDownload(mockInteraction);

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Please enter the Document ID you wish to download:',
        ephemeral: true,
      });

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        docId,
        userId,
        DocumentPermission.READ
      );

      expect(docService.findByDocId).toHaveBeenCalledWith(docId);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: `Here is your document "${document.title}":`,
        files: [expect.any(AttachmentBuilder)],
        ephemeral: true,
      });

      expect(mockResponseMessage.delete).toHaveBeenCalled();
    });

    it('should handle lack of READ permission', async () => {
      const userId = mockInteraction.user.id;
      const docId = 'doc123';

      const mockResponseMessage = {
        content: docId,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock).mockResolvedValueOnce({
        first: () => mockResponseMessage,
      });

      (permissionsService.hasPermission as jest.Mock).mockResolvedValueOnce(
        false
      );

      await command.onDownload(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: 'You do not have read access to this document.',
        ephemeral: true,
      });

      expect(docService.findByDocId).not.toHaveBeenCalled();
      expect(mockResponseMessage.delete).toHaveBeenCalled();
    });

    it('should handle document not found', async () => {
      const userId = mockInteraction.user.id;
      const docId = 'doc123';

      const mockResponseMessage = {
        content: docId,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock).mockResolvedValueOnce({
        first: () => mockResponseMessage,
      });

      (permissionsService.hasPermission as jest.Mock).mockResolvedValueOnce(
        true
      );
      (docService.findByDocId as jest.Mock).mockResolvedValueOnce(null);

      await command.onDownload(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: `Document with ID "${docId}" not found.`,
        ephemeral: true,
      });

      expect(mockResponseMessage.delete).toHaveBeenCalled();
    });

    it('should handle user not responding in time', async () => {
      (mockChannel.awaitMessages as jest.Mock).mockRejectedValueOnce(
        new Error('time')
      );

      await command.onDownload(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content:
          'You did not respond in time (30 seconds). Please try the command again.',
        ephemeral: true,
      });

      expect(docService.findByDocId).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const userId = mockInteraction.user.id;
      const docId = 'doc123';

      const mockResponseMessage = {
        content: docId,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock).mockResolvedValueOnce({
        first: () => mockResponseMessage,
      });

      const error = new Error('Unexpected error');
      (permissionsService.hasPermission as jest.Mock).mockRejectedValueOnce(
        error
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await command.onDownload(mockInteraction);

      expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred:', error);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: 'An unexpected error occurred. Please try again later.',
        ephemeral: true,
      });

      expect(mockResponseMessage.delete).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle error when channel is null', async () => {
      const interactionWithNoChannel = {
        ...mockInteraction,
        channel: null,
      } as unknown as CommandInteraction;

      await command.onDownload(interactionWithNoChannel);

      expect(interactionWithNoChannel.reply).toHaveBeenCalledWith({
        content: 'An error occurred: Unable to access the channel.',
        ephemeral: true,
      });

      expect(docService.findByDocId).not.toHaveBeenCalled();
    });
  });
});
