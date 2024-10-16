import { Test, TestingModule } from '@nestjs/testing';
import { DocRepository } from './doc.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Doc, DocDocument } from '../schemas/doc.schema';
import { Model } from 'mongoose';
import { mockDocs, mockDocModel } from '../__mocks__/doc.mocks';

describe('DocRepository', () => {
  let repository: DocRepository;
  let model: Model<DocDocument>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DocRepository,
        {
          provide: getModelToken(Doc.name),
          useValue: mockDocModel,
        },
      ],
    }).compile();

    repository = moduleRef.get<DocRepository>(DocRepository);
    model = moduleRef.get<Model<DocDocument>>(getModelToken(Doc.name));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByDocId', () => {
    it('should return a document when found', async () => {
      const docId = 'doc123';
      const expectedDoc = mockDocs[0];

      mockDocModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(expectedDoc),
      });

      const result = await repository.findByDocId(docId);

      expect(result).toBe(expectedDoc);
      expect(model.findOne).toHaveBeenCalledWith({ docId });
    });

    it('should return null when document is not found', async () => {
      const docId = 'nonexistent';

      mockDocModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      const result = await repository.findByDocId(docId);

      expect(result).toBeNull();
      expect(model.findOne).toHaveBeenCalledWith({ docId });
    });
  });

  describe('findAllByOwner', () => {
    it('should return documents owned by the specified user', async () => {
      const ownerId = '11111111111111111';
      const expectedDocs = mockDocs;

      mockDocModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(expectedDocs),
      });

      const result = await repository.findAllByOwner(ownerId);

      expect(result).toBe(expectedDocs);
      expect(model.find).toHaveBeenCalledWith({ ownerId });
    });

    it('should return an empty array when no documents are found', async () => {
      const ownerId = 'nonexistent';

      mockDocModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
      });

      const result = await repository.findAllByOwner(ownerId);

      expect(result).toEqual([]);
      expect(model.find).toHaveBeenCalledWith({ ownerId });
    });
  });

  describe('findAllByCollaborator', () => {
    it('should return documents where the user is a collaborator', async () => {
      const discordId = '22222222222222222';
      const expectedDocs = [mockDocs[0]];

      mockDocModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(expectedDocs),
      });

      const result = await repository.findAllByCollaborator(discordId);

      expect(result).toBe(expectedDocs);
      expect(model.find).toHaveBeenCalledWith({
        'collaborators.discordId': discordId,
      });
    });

    it('should return an empty array when no documents are found', async () => {
      const discordId = 'nonexistent';

      mockDocModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
      });

      const result = await repository.findAllByCollaborator(discordId);

      expect(result).toEqual([]);
      expect(model.find).toHaveBeenCalledWith({
        'collaborators.discordId': discordId,
      });
    });
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const docData = {
        docId: 'doc789',
        ownerId: '44444444444444444',
        title: 'New Document',
        content: 'This is a new document.',
      };
      const createdDoc = { ...docData, revision: 1, collaborators: [] };

      mockDocModel.create.mockResolvedValueOnce(createdDoc);

      const result = await repository.create(docData);

      expect(result).toBe(createdDoc);
      expect(model.create).toHaveBeenCalledWith(docData);
    });
  });

  describe('update', () => {
    it('should update an existing document', async () => {
      const docId = 'doc123';
      const updatedDetails = { title: 'Updated Title' };
      const updatedDoc = { ...mockDocs[0], ...updatedDetails };

      mockDocModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedDoc),
      });

      const result = await repository.update(docId, updatedDetails);

      expect(result).toBe(updatedDoc);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { docId },
        updatedDetails,
        { new: true }
      );
    });

    it('should return null when document is not found', async () => {
      const docId = 'nonexistent';
      const updatedDetails = { title: 'Updated Title' };

      mockDocModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      const result = await repository.update(docId, updatedDetails);

      expect(result).toBeNull();
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { docId },
        updatedDetails,
        { new: true }
      );
    });
  });
});
