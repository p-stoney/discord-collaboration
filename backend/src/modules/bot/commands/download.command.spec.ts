import { DownloadCommand } from './download.command';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import { CommandInteraction, User } from 'discord.js';
import { DownloadDocumentDto } from './dtos/download-document.dto';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';
import { ForbiddenException } from '@nestjs/common';

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

  const mockInteraction = {
    user: {
      id: '123456789012345678',
    } as User,
    reply: jest.fn(),
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

  describe('onDownloadDocument', () => {
    it('should download the document when the user has permission', async () => {
      const discordId = mockInteraction.user.id;
      const dto: DownloadDocumentDto = {
        docId: 'doc123',
      };

      const mockDocument = {
        id: 'doc123',
        title: 'Test Document',
        content: 'This is a test document.',
      };

      mockPermissionsService.hasPermission.mockResolvedValueOnce(true);
      mockDocService.findByDocId.mockResolvedValueOnce(mockDocument);

      await command.onDownloadDocument(dto, mockInteraction);

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        dto.docId,
        discordId,
        DocumentPermission.READ
      );

      expect(docService.findByDocId).toHaveBeenCalledWith(dto.docId);

      const expectedFileName = `${mockDocument.title}.txt`;
      const expectedFileBuffer = Buffer.from(mockDocument.content, 'utf-8');

      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: `Here is your document "${mockDocument.title}":`,
        files: [
          expect.objectContaining({
            name: expectedFileName,
            attachment: expectedFileBuffer,
          }),
        ],
        ephemeral: true,
      });
    });

    it('should throw an error if the user lacks READ permission', async () => {
      const discordId = mockInteraction.user.id;
      const dto: DownloadDocumentDto = {
        docId: 'doc123',
      };

      mockPermissionsService.hasPermission.mockResolvedValueOnce(false);

      await expect(
        command.onDownloadDocument(dto, mockInteraction)
      ).rejects.toThrow(ForbiddenException);

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        dto.docId,
        discordId,
        DocumentPermission.READ
      );

      expect(docService.findByDocId).not.toHaveBeenCalled();
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });

    it('should throw an error if the document is not found', async () => {
      const discordId = mockInteraction.user.id;
      const dto: DownloadDocumentDto = {
        docId: 'doc123',
      };

      mockPermissionsService.hasPermission.mockResolvedValueOnce(true);
      mockDocService.findByDocId.mockResolvedValueOnce(null);

      await expect(
        command.onDownloadDocument(dto, mockInteraction)
      ).rejects.toThrow(ForbiddenException);

      expect(permissionsService.hasPermission).toHaveBeenCalledWith(
        dto.docId,
        discordId,
        DocumentPermission.READ
      );

      expect(docService.findByDocId).toHaveBeenCalledWith(dto.docId);
      expect(mockInteraction.reply).not.toHaveBeenCalled();
    });
  });
});
