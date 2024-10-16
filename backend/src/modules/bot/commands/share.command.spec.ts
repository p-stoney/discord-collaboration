import { ShareCommand } from './share.command';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import { CommandInteraction, User, Client } from 'discord.js';
import { ShareDocumentDto } from './dtos/share-document.dto';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';
import { ForbiddenException } from '@nestjs/common';

describe('ShareDocumentCommand', () => {
  let command: ShareCommand;
  let docService: DocService;
  let permissionsService: PermissionsService;

  const mockDocService = {
    addCollaborators: jest.fn(),
  };

  const mockPermissionsService = {
    hasPermission: jest.fn(),
  };

  const mockInteraction = {
    user: {
      id: '123456789012345678',
    } as User,
    client: {
      users: {
        fetch: jest.fn(),
      },
    } as unknown as Client,
    reply: jest.fn(),
  } as unknown as CommandInteraction;

  beforeEach(() => {
    docService = mockDocService as unknown as DocService;
    permissionsService =
      mockPermissionsService as unknown as PermissionsService;
    command = new ShareCommand(docService, permissionsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onShareDocument', () => {
    it('should share a document with users and send confirmation', async () => {
      const discordId = mockInteraction.user.id;
      const dto: ShareDocumentDto = {
        docId: 'doc123',
        users: ['111111111111111111', '222222222222222222'],
        permission: DocumentPermission.WRITE,
      };

      mockPermissionsService.hasPermission.mockResolvedValueOnce(true);
      mockDocService.addCollaborators.mockResolvedValueOnce(null);

      const mockFetchedUser1 = {
        send: jest.fn().mockResolvedValueOnce(null),
      };
      const mockFetchedUser2 = {
        send: jest.fn().mockResolvedValueOnce(null),
      };

      (mockInteraction.client.users.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFetchedUser1)
        .mockResolvedValueOnce(mockFetchedUser2);

      await command.onShareDocument(dto, mockInteraction);

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        dto.docId,
        discordId,
        DocumentPermission.ADMIN
      );

      expect(docService.addCollaborators).toHaveBeenCalledWith({
        docId: dto.docId,
        users: dto.users,
        permission: dto.permission,
      });

      expect(mockInteraction.client.users.fetch).toHaveBeenCalledTimes(2);
      expect(mockInteraction.client.users.fetch).toHaveBeenCalledWith(
        dto.users[0]
      );
      expect(mockInteraction.client.users.fetch).toHaveBeenCalledWith(
        dto.users[1]
      );

      expect(mockFetchedUser1.send).toHaveBeenCalledWith(
        `You have been granted ${dto.permission} access to document "${dto.docId}".`
      );
      expect(mockFetchedUser2.send).toHaveBeenCalledWith(
        `You have been granted ${dto.permission} access to document "${dto.docId}".`
      );

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `Document "${dto.docId}" shared successfully with users: ${dto.users.join(
          ', '
        )}.`,
        ephemeral: true,
      });
    });

    it('should handle errors when sending DM fails', async () => {
      const discordId = mockInteraction.user.id;
      const dto: ShareDocumentDto = {
        docId: 'doc123',
        users: ['111111111111111111'],
        permission: DocumentPermission.READ,
      };

      mockPermissionsService.hasPermission.mockResolvedValueOnce(true);
      mockDocService.addCollaborators.mockResolvedValueOnce(null);

      const mockFetchedUser = {
        send: jest.fn().mockRejectedValueOnce(new Error('DM Failed')),
      };

      (mockInteraction.client.users.fetch as jest.Mock).mockResolvedValueOnce(
        mockFetchedUser
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await command.onShareDocument(dto, mockInteraction);

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        dto.docId,
        discordId,
        DocumentPermission.ADMIN
      );

      expect(docService.addCollaborators).toHaveBeenCalledWith({
        docId: dto.docId,
        users: dto.users,
        permission: dto.permission,
      });

      expect(mockInteraction.client.users.fetch).toHaveBeenCalledWith(
        dto.users[0]
      );

      expect(mockFetchedUser.send).toHaveBeenCalledWith(
        `You have been granted ${dto.permission} access to document "${dto.docId}".`
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Could not send DM to user ${dto.users[0]}:`,
        expect.any(Error)
      );

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `Document "${dto.docId}" shared successfully with users: ${dto.users.join(
          ', '
        )}.`,
        ephemeral: true,
      });

      consoleErrorSpy.mockRestore();
    });

    it('should throw an error if user lacks ADMIN permission', async () => {
      const discordId = mockInteraction.user.id;

      const dto: ShareDocumentDto = {
        docId: 'doc123',
        users: ['111111111111111111'],
        permission: DocumentPermission.WRITE,
      };

      mockPermissionsService.hasPermission.mockResolvedValueOnce(false);

      await expect(
        command.onShareDocument(dto, mockInteraction)
      ).rejects.toThrow(ForbiddenException);

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        dto.docId,
        discordId,
        DocumentPermission.ADMIN
      );

      expect(docService.addCollaborators).not.toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });
  });
});
