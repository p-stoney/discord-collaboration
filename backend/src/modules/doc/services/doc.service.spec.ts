import { Test, TestingModule } from '@nestjs/testing';
import { Document } from 'mongoose';
import { DocService } from './doc.service';
import { DocRepository } from '../repositories/doc.repository';
import { DocVersionRepository } from '../repositories/doc-version.repository';
import { DocDocument } from '../schemas/doc.schema';
import {
  CreateDocDto,
  UpdateDocDto,
  AddCollaboratorsDto,
  CollaboratorDto,
} from '../dtos';
import { NotFoundException } from '@nestjs/common';
import { mockDocs } from '../__mocks__/doc.mocks';
import { DocumentPermission } from '../enums/doc-permission.enum';

describe('DocService', () => {
  let service: DocService;
  let docRepository: DocRepository;
  let docVersionRepository: DocVersionRepository;

  const mockDocRepository = {
    findByDocId: jest.fn(),
    findAllByOwner: jest.fn(),
    findAllByCollaborator: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockDocVersionRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DocService,
        {
          provide: DocRepository,
          useValue: mockDocRepository,
        },
        {
          provide: DocVersionRepository,
          useValue: mockDocVersionRepository,
        },
      ],
    }).compile();

    service = moduleRef.get<DocService>(DocService);
    docRepository = moduleRef.get<DocRepository>(DocRepository);
    docVersionRepository =
      moduleRef.get<DocVersionRepository>(DocVersionRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByDocId', () => {
    it('should return a document when found', async () => {
      const docId = 'doc123';
      const expectedDoc = mockDocs[0];

      mockDocRepository.findByDocId.mockResolvedValueOnce(expectedDoc);

      const result = await service.findByDocId(docId);

      expect(result).toBe(expectedDoc);
      expect(docRepository.findByDocId).toHaveBeenCalledWith(docId);
    });

    it('should throw NotFoundException when document is not found', async () => {
      const docId = 'nonexistent';

      mockDocRepository.findByDocId.mockResolvedValueOnce(null);

      await expect(service.findByDocId(docId)).rejects.toThrow(
        NotFoundException
      );
      expect(docRepository.findByDocId).toHaveBeenCalledWith(docId);
    });
  });

  describe('findAllByOwner', () => {
    it('should return documents owned by the specified user', async () => {
      const ownerId = '11111111111111111';
      const expectedDocs = mockDocs;

      mockDocRepository.findAllByOwner.mockResolvedValueOnce(expectedDocs);

      const result = await service.findAllByOwner(ownerId);

      expect(result).toBe(expectedDocs);
      expect(docRepository.findAllByOwner).toHaveBeenCalledWith(ownerId);
    });

    it('should throw NotFoundException when no documents are found', async () => {
      const ownerId = 'nonexistent';

      mockDocRepository.findAllByOwner.mockResolvedValueOnce([]);

      await expect(service.findAllByOwner(ownerId)).rejects.toThrow(
        NotFoundException
      );
      expect(docRepository.findAllByOwner).toHaveBeenCalledWith(ownerId);
    });
  });

  describe('findAllByCollaborator', () => {
    it('should return documents where the user is a collaborator', async () => {
      const discordId = '22222222222222222';
      const expectedDocs = [mockDocs[0]];

      mockDocRepository.findAllByCollaborator.mockResolvedValueOnce(
        expectedDocs
      );

      const result = await service.findAllByCollaborator(discordId);

      expect(result).toBe(expectedDocs);
      expect(docRepository.findAllByCollaborator).toHaveBeenCalledWith(
        discordId
      );
    });

    it('should throw NotFoundException when no documents are found', async () => {
      const discordId = 'nonexistent';

      mockDocRepository.findAllByCollaborator.mockResolvedValueOnce([]);

      await expect(service.findAllByCollaborator(discordId)).rejects.toThrow(
        NotFoundException
      );
      expect(docRepository.findAllByCollaborator).toHaveBeenCalledWith(
        discordId
      );
    });
  });

  describe('create', () => {
    it('should create a new document and its initial version', async () => {
      const createDocDto: CreateDocDto = {
        ownerId: '11111111111111111',
        title: 'New Document',
        content: '',
      };

      const newDocData = {
        ...createDocDto,
        docId: `${createDocDto.ownerId}-${Date.now()}`,
        content: '',
        revision: 1,
      };

      const createdDoc: DocDocument = {
        ...newDocData,
        collaborators: [],
      } as DocDocument;

      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1609459200000);

      newDocData.docId = `${createDocDto.ownerId}-1609459200000`;
      createdDoc.docId = newDocData.docId;

      mockDocRepository.create.mockResolvedValueOnce({
        ...createdDoc,
        toObject: jest.fn().mockReturnValue(createdDoc),
      });
      mockDocVersionRepository.create.mockResolvedValueOnce(null);

      const result = await service.create(createDocDto);

      expect(result).toEqual({
        ...createdDoc,
        toObject: expect.any(Function),
      });
      expect(docRepository.create).toHaveBeenCalledWith(newDocData);
      expect(docVersionRepository.create).toHaveBeenCalledWith(createdDoc);

      dateNowSpy.mockRestore();
    });
  });

  describe('update', () => {
    it('should update an existing document and create a new version', async () => {
      const updateDocDto: UpdateDocDto = {
        docId: 'doc123',
        updatedDetails: {
          title: 'Updated Title',
          content: 'Updated content.',
        },
      };

      const existingDoc = {
        ...mockDocs[0],
        toObject: jest.fn().mockReturnValue({ ...mockDocs[0] }),
      } as unknown as DocDocument & Document;

      const updatedDocData = {
        ...existingDoc.toObject(),
        ...updateDocDto.updatedDetails,
        revision: existingDoc.revision + 1,
      };

      const updatedDoc = {
        ...updatedDocData,
        toObject: jest.fn().mockReturnValue({ ...updatedDocData }),
      } as unknown as DocDocument & Document;

      mockDocRepository.findByDocId.mockResolvedValueOnce(existingDoc);
      mockDocRepository.update.mockResolvedValueOnce(updatedDoc);
      mockDocVersionRepository.create.mockResolvedValueOnce(null);

      const result = await service.update(updateDocDto);

      expect(result).toBe(updatedDoc);
      expect(docRepository.findByDocId).toHaveBeenCalledWith(
        updateDocDto.docId
      );
      expect(docRepository.update).toHaveBeenCalledWith(
        updateDocDto.docId,
        updatedDocData
      );
      expect(docVersionRepository.create).toHaveBeenCalledWith(
        updatedDoc.toObject()
      );
    });

    it('should throw NotFoundException when document is not found', async () => {
      const updateDocDto: UpdateDocDto = {
        docId: 'nonexistent',
        updatedDetails: {
          title: 'Updated Title',
          content: 'Updated content.',
        },
      };

      mockDocRepository.findByDocId.mockResolvedValueOnce(null);

      await expect(service.update(updateDocDto)).rejects.toThrow(
        NotFoundException
      );
      expect(docRepository.findByDocId).toHaveBeenCalledWith(
        updateDocDto.docId
      );
    });
  });

  describe('addCollaborators', () => {
    it('should add new collaborators and update existing ones', async () => {
      const existingDoc: DocDocument = mockDocs[0];

      const addCollaboratorsDto: AddCollaboratorsDto = {
        docId: 'doc123',
        users: ['22222222222222222', '44444444444444444'],
        permission: DocumentPermission.WRITE,
      };

      const updatedCollaborators: CollaboratorDto[] = [
        {
          discordId: '22222222222222222',
          permission: DocumentPermission.WRITE,
        },
        {
          discordId: '33333333333333333',
          permission: DocumentPermission.READ,
        },
      ];

      const newCollaborators: CollaboratorDto[] = [
        {
          discordId: '44444444444444444',
          permission: DocumentPermission.WRITE,
        },
      ];

      const allCollaborators = [...updatedCollaborators, ...newCollaborators];

      const updatedDocData = {
        ...existingDoc,
        collaborators: allCollaborators,
        revision: existingDoc.revision + 1,
      };

      const updatedDoc: DocDocument = {
        ...updatedDocData,
      } as DocDocument;

      jest.spyOn(service, 'findByDocId').mockResolvedValueOnce(existingDoc);
      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedDoc);

      const result = await service.addCollaborators(addCollaboratorsDto);

      expect(result).toBe(updatedDoc);
      expect(service.findByDocId).toHaveBeenCalledWith(
        addCollaboratorsDto.docId
      );
      expect(service.update).toHaveBeenCalledWith({
        docId: addCollaboratorsDto.docId,
        updatedDetails: { collaborators: allCollaborators },
      });
    });

    it('should throw NotFoundException when document is not found', async () => {
      const addCollaboratorsDto: AddCollaboratorsDto = {
        docId: 'nonexistent',
        users: ['44444444444444444'],
        permission: DocumentPermission.WRITE,
      };

      jest
        .spyOn(service, 'findByDocId')
        .mockRejectedValueOnce(
          new NotFoundException(
            `Document with ID ${addCollaboratorsDto.docId} not found`
          )
        );

      await expect(
        service.addCollaborators(addCollaboratorsDto)
      ).rejects.toThrow(NotFoundException);
      expect(service.findByDocId).toHaveBeenCalledWith(
        addCollaboratorsDto.docId
      );
    });
  });
});
