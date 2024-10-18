import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { DocService } from './doc.service';
import { DocumentPermission } from '../enums/doc-permission.enum';
import { NotFoundException } from '@nestjs/common';
import { mockDocs } from '../__mocks__/doc.mocks';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let docService: DocService;

  const mockDocService = {
    findByDocId: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: DocService,
          useValue: mockDocService,
        },
      ],
    }).compile();

    service = moduleRef.get<PermissionsService>(PermissionsService);
    docService = moduleRef.get<DocService>(DocService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPermission', () => {
    it('should return ADMIN if user is the owner of the document', async () => {
      const docId = 'doc123';
      const discordId = '11111111111111111';
      const document = mockDocs[0];

      mockDocService.findByDocId.mockResolvedValueOnce(document);

      const result = await service.findPermission(docId, discordId);

      expect(result).toBe(DocumentPermission.ADMIN);
      expect(docService.findByDocId).toHaveBeenCalledWith(docId);
    });

    it('should return the collaborator permission if user is a collaborator', async () => {
      const docId = 'doc123';
      const discordId = '22222222222222222';
      const document = mockDocs[0];

      mockDocService.findByDocId.mockResolvedValueOnce(document);

      const result = await service.findPermission(docId, discordId);

      expect(result).toBe(DocumentPermission.WRITE);
      expect(docService.findByDocId).toHaveBeenCalledWith(docId);
    });

    it('should return null if user has no permissions on the document', async () => {
      const docId = 'doc123';
      const discordId = '55555555555555555';
      const document = mockDocs[0];

      mockDocService.findByDocId.mockResolvedValueOnce(document);

      const result = await service.findPermission(docId, discordId);

      expect(result).toBeNull();
      expect(docService.findByDocId).toHaveBeenCalledWith(docId);
    });

    it('should throw NotFoundException if the document is not found', async () => {
      const docId = 'nonexistent';
      const discordId = '11111111111111111';

      mockDocService.findByDocId.mockRejectedValueOnce(
        new NotFoundException(`Document with ID ${docId} not found`)
      );

      await expect(service.findPermission(docId, discordId)).rejects.toThrow(
        NotFoundException
      );
      expect(docService.findByDocId).toHaveBeenCalledWith(docId);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has required permission level (exact match)', async () => {
      const docId = 'doc123';
      const discordId = '22222222222222222';
      const requiredPermission = DocumentPermission.WRITE;

      jest
        .spyOn(service, 'findPermission')
        .mockResolvedValueOnce(DocumentPermission.WRITE);

      const result = await service.hasPermission(
        docId,
        discordId,
        requiredPermission
      );

      expect(result).toBe(true);
      expect(service.findPermission).toHaveBeenCalledWith(docId, discordId);
    });

    it('should return true if user has higher permission level than required', async () => {
      const docId = 'doc123';
      const discordId = '11111111111111111';
      const requiredPermission = DocumentPermission.WRITE;

      jest
        .spyOn(service, 'findPermission')
        .mockResolvedValueOnce(DocumentPermission.ADMIN);

      const result = await service.hasPermission(
        docId,
        discordId,
        requiredPermission
      );

      expect(result).toBe(true);
      expect(service.findPermission).toHaveBeenCalledWith(docId, discordId);
    });

    it('should return false if user has lower permission level than required', async () => {
      const docId = 'doc123';
      const discordId = '33333333333333333';
      const requiredPermission = DocumentPermission.WRITE;

      jest
        .spyOn(service, 'findPermission')
        .mockResolvedValueOnce(DocumentPermission.READ);

      const result = await service.hasPermission(
        docId,
        discordId,
        requiredPermission
      );

      expect(result).toBe(false);
      expect(service.findPermission).toHaveBeenCalledWith(docId, discordId);
    });

    it('should return false if user has no permissions on the document', async () => {
      const docId = 'doc123';
      const discordId = '55555555555555555';
      const requiredPermission = DocumentPermission.READ;

      jest.spyOn(service, 'findPermission').mockResolvedValueOnce(null);

      const result = await service.hasPermission(
        docId,
        discordId,
        requiredPermission
      );

      expect(result).toBe(false);
      expect(service.findPermission).toHaveBeenCalledWith(docId, discordId);
    });

    it('should return false if document is not found', async () => {
      const docId = 'nonexistent';
      const discordId = '11111111111111111';
      const requiredPermission = DocumentPermission.READ;

      jest
        .spyOn(service, 'findPermission')
        .mockRejectedValueOnce(
          new NotFoundException(`Document with ID ${docId} not found`)
        );

      await expect(
        service.hasPermission(docId, discordId, requiredPermission)
      ).rejects.toThrow(NotFoundException);
      expect(service.findPermission).toHaveBeenCalledWith(docId, discordId);
    });
  });
});
