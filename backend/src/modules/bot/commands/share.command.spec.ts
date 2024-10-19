import { ShareCommand } from './share.command';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import {
  CommandInteraction,
  User,
  Client,
  TextChannel,
  Message,
} from 'discord.js';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';

describe('ShareCommand', () => {
  let command: ShareCommand;
  let docService: DocService;
  let permissionsService: PermissionsService;

  const mockDocService = {
    addCollaborators: jest.fn(),
  };

  const mockPermissionsService = {
    hasPermission: jest.fn(),
  };

  const mockUser = {
    id: '123456789012345678',
  } as User;

  const mockClient = {
    users: {
      fetch: jest.fn(),
    },
  } as unknown as Client;

  const mockChannel = {
    awaitMessages: jest.fn(),
  } as unknown as TextChannel;

  const mockInteraction = {
    user: mockUser,
    client: mockClient,
    reply: jest.fn(),
    followUp: jest.fn(),
    channel: mockChannel,
  } as unknown as CommandInteraction;

  beforeEach(() => {
    docService = mockDocService as unknown as DocService;
    permissionsService =
      mockPermissionsService as unknown as PermissionsService;
    command = new ShareCommand(docService, permissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onShare', () => {
    it('should share a document with users and send confirmation', async () => {
      const userId = mockInteraction.user.id;
      const docId = 'doc123';
      const userMentions = '<@111111111111111111> <@222222222222222222>';
      const users = ['111111111111111111', '222222222222222222'];
      const permissionContent = 'WRITE';

      const mockDocIdResponse = {
        content: docId,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      const mockUsersResponse = {
        content: userMentions,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      const mockPermissionResponse = {
        content: permissionContent,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock)
        .mockResolvedValueOnce({ first: () => mockDocIdResponse })
        .mockResolvedValueOnce({ first: () => mockUsersResponse })
        .mockResolvedValueOnce({ first: () => mockPermissionResponse });

      (permissionsService.hasPermission as jest.Mock).mockResolvedValueOnce(
        true
      );
      (docService.addCollaborators as jest.Mock).mockResolvedValueOnce(null);

      const mockFetchedUser1 = {
        send: jest.fn().mockResolvedValueOnce(null),
      };
      const mockFetchedUser2 = {
        send: jest.fn().mockResolvedValueOnce(null),
      };

      (mockClient.users.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFetchedUser1)
        .mockResolvedValueOnce(mockFetchedUser2);

      await command.onShare(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: `Document "${docId}" shared successfully with users: ${users.join(
          ', '
        )}.`,
        ephemeral: true,
      });

      expect(mockDocIdResponse.delete).toHaveBeenCalled();
      expect(mockUsersResponse.delete).toHaveBeenCalled();
      expect(mockPermissionResponse.delete).toHaveBeenCalled();

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        docId,
        userId,
        DocumentPermission.ADMIN
      );

      expect(docService.addCollaborators).toHaveBeenCalledWith({
        docId: docId,
        users: users,
        permission: 'WRITE',
      });

      expect(mockClient.users.fetch).toHaveBeenCalledTimes(2);
      expect(mockClient.users.fetch).toHaveBeenCalledWith(users[0]);
      expect(mockClient.users.fetch).toHaveBeenCalledWith(users[1]);

      expect(mockFetchedUser1.send).toHaveBeenCalledWith(
        `You have been granted WRITE access to document "${docId}".`
      );
      expect(mockFetchedUser2.send).toHaveBeenCalledWith(
        `You have been granted WRITE access to document "${docId}".`
      );
    });

    it('should handle invalid permission level', async () => {
      const userId = mockInteraction.user.id;
      const docId = 'doc123';
      const userMentions = '<@111111111111111111>';
      const permissionContent = 'INVALID';

      const mockDocIdResponse = {
        content: docId,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      const mockUsersResponse = {
        content: userMentions,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      const mockPermissionResponse = {
        content: permissionContent,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock)
        .mockResolvedValueOnce({ first: () => mockDocIdResponse })
        .mockResolvedValueOnce({ first: () => mockUsersResponse })
        .mockResolvedValueOnce({ first: () => mockPermissionResponse });

      (permissionsService.hasPermission as jest.Mock).mockResolvedValueOnce(
        true
      );

      await command.onShare(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content:
          'Invalid permission level provided. Please try the command again.',
        ephemeral: true,
      });

      expect(docService.addCollaborators).not.toHaveBeenCalled();
    });

    it('should handle user lacking ADMIN permission', async () => {
      const userId = mockInteraction.user.id;
      const docId = 'doc123';

      const mockDocIdResponse = {
        content: docId,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock).mockResolvedValueOnce({
        first: () => mockDocIdResponse,
      });

      (permissionsService.hasPermission as jest.Mock).mockResolvedValueOnce(
        false
      );

      await command.onShare(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: 'You do not have admin access to this document.',
        ephemeral: true,
      });

      expect(docService.addCollaborators).not.toHaveBeenCalled();
    });

    it('should handle user not responding in time', async () => {
      (mockChannel.awaitMessages as jest.Mock).mockRejectedValueOnce(
        new Error('time')
      );

      await command.onShare(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content:
          'You did not respond in time (30 seconds). Please try the command again.',
        ephemeral: true,
      });

      expect(docService.addCollaborators).not.toHaveBeenCalled();
    });

    it('should handle no users mentioned', async () => {
      const userId = mockInteraction.user.id;
      const docId = 'doc123';

      const mockDocIdResponse = {
        content: docId,
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      const mockUsersResponse = {
        content: '',
        author: { id: userId },
        delete: jest.fn(),
      } as unknown as Message;

      (mockChannel.awaitMessages as jest.Mock)
        .mockResolvedValueOnce({ first: () => mockDocIdResponse })
        .mockResolvedValueOnce({ first: () => mockUsersResponse });

      (permissionsService.hasPermission as jest.Mock).mockResolvedValueOnce(
        true
      );

      await command.onShare(mockInteraction);

      expect(mockInteraction.followUp).toHaveBeenCalledWith({
        content: 'No users were mentioned. Please try the command again.',
        ephemeral: true,
      });

      expect(docService.addCollaborators).not.toHaveBeenCalled();
    });

    it('should handle error when channel is null', async () => {
      const interactionWithNoChannel = {
        ...mockInteraction,
        channel: null,
      } as unknown as CommandInteraction;

      await command.onShare(interactionWithNoChannel);

      expect(interactionWithNoChannel.reply).toHaveBeenCalledWith({
        content: 'An error occurred: Unable to access the channel.',
        ephemeral: true,
      });

      expect(docService.addCollaborators).not.toHaveBeenCalled();
    });
  });
});
