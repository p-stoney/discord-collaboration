import { Test, TestingModule } from '@nestjs/testing';
import { DocController } from './doc.controller';
import { DocService } from './services/doc.service';
import {
  DocDto,
  CreateDocDto,
  UpdateDocDto,
  AddCollaboratorsDto,
} from './dtos';
import { AuthenticatedGuard } from '../auth/guards';
import { PermissionGuard } from './guards';
import { DocumentPermission } from './enums/doc-permission.enum';
import {
  mockDocs,
  mockDocService,
  mockUser,
  MockAuthenticatedGuard,
  MockPermissionGuard,
} from './__mocks__/doc.mocks';

describe('DocController', () => {
  let controller: DocController;
  let docService: DocService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DocController],
      providers: [
        {
          provide: DocService,
          useValue: mockDocService,
        },
      ],
    })
      .overrideGuard(AuthenticatedGuard)
      .useClass(MockAuthenticatedGuard)
      .overrideGuard(PermissionGuard)
      .useClass(MockPermissionGuard)
      .compile();

    controller = moduleRef.get<DocController>(DocController);
    docService = moduleRef.get<DocService>(DocService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDocument', () => {
    it('should return a document', async () => {
      const docId = 'doc123';
      const expectedDoc = mockDocs[0];

      mockDocService.findByDocId.mockResolvedValueOnce(expectedDoc);

      const result = await controller.getDocument(docId);

      expect(result).toBe(expectedDoc);
      expect(docService.findByDocId).toHaveBeenCalledWith(docId);
    });
  });

  describe('getOwnedDocuments', () => {
    it('should return documents owned by the authenticated user', async () => {
      const expectedDocs = mockDocs;

      mockDocService.findAllByOwner.mockResolvedValueOnce(expectedDocs);

      const result = await controller.getOwnedDocuments({
        user: mockUser,
      } as any);

      expect(result).toBe(expectedDocs);
      expect(docService.findAllByOwner).toHaveBeenCalledWith(
        mockUser.discordId
      );
    });
  });

  describe('getCollaboratedDocuments', () => {
    it('should return documents where the authenticated user is a collaborator', async () => {
      const expectedDocs = [mockDocs[0]];

      mockDocService.findAllByCollaborator.mockResolvedValueOnce(expectedDocs);

      const result = await controller.getCollaboratedDocuments({
        user: mockUser,
      } as any);

      expect(result).toBe(expectedDocs);
      expect(docService.findAllByCollaborator).toHaveBeenCalledWith(
        mockUser.discordId
      );
    });
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const createDocDto: CreateDocDto = {
        ownerId: '',
        title: 'New Document',
        content: '',
      };

      const createdDoc = {
        ...createDocDto,
        ownerId: mockUser.discordId,
        docId: 'new-doc-id',
        content: '',
        revision: 1,
        collaborators: [],
      } as DocDto;

      mockDocService.create.mockResolvedValueOnce(createdDoc);

      const result = await controller.createDocument(
        { user: mockUser } as any,
        createDocDto
      );

      expect(result).toBe(createdDoc);
      expect(docService.create).toHaveBeenCalledWith({
        ...createDocDto,
        ownerId: mockUser.discordId,
      });
    });
  });

  describe('updateDocument', () => {
    it('should update a document', async () => {
      const docId = 'doc123';
      const updateDocDto: UpdateDocDto = {
        docId: '',
        updatedDetails: {
          title: 'Updated Title',
          content: 'Updated content.',
        },
      };

      const updatedDoc = {
        ...mockDocs[0],
        ...updateDocDto.updatedDetails,
        revision: mockDocs[0].revision + 1,
      } as DocDto;

      mockDocService.update.mockResolvedValueOnce(updatedDoc);

      const result = await controller.updateDocument(docId, updateDocDto);

      expect(result).toBe(updatedDoc);
      expect(docService.update).toHaveBeenCalledWith({
        ...updateDocDto,
        docId,
      });
    });
  });

  describe('addCollaborators', () => {
    it('should add collaborators to a document', async () => {
      const docId = 'doc123';
      const addCollaboratorsDto: AddCollaboratorsDto = {
        docId: '',
        users: ['55555555555555555'],
        permission: DocumentPermission.READ,
      };

      const updatedDoc = {
        ...mockDocs[0],
        collaborators: [
          ...mockDocs[0].collaborators,
          {
            discordId: '55555555555555555',
            permission: 'READ',
          },
        ],
      } as DocDto;

      mockDocService.addCollaborators.mockResolvedValueOnce(updatedDoc);

      const result = await controller.addCollaborators(
        docId,
        addCollaboratorsDto
      );

      expect(result).toBe(updatedDoc);
      expect(docService.addCollaborators).toHaveBeenCalledWith({
        ...addCollaboratorsDto,
        docId,
      });
    });
  });
});
