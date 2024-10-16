import { Test, TestingModule } from '@nestjs/testing';
import { DocVersionRepository } from './doc-version.repository';
import { getModelToken } from '@nestjs/mongoose';
import { DocVersion, DocVersionDocument } from '../schemas/doc-version.schema';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { mockDocVersions } from '../__mocks__/doc.mocks';
import { DocDto } from '../dtos';

describe('DocVersionRepository', () => {
  let repository: DocVersionRepository;
  let model: Model<DocVersionDocument>;

  const mockDocVersionModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DocVersionRepository,
        {
          provide: getModelToken(DocVersion.name),
          useValue: mockDocVersionModel,
        },
      ],
    }).compile();

    repository = moduleRef.get<DocVersionRepository>(DocVersionRepository);
    model = moduleRef.get<Model<DocVersionDocument>>(
      getModelToken(DocVersion.name)
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new document version', async () => {
      const docDto: DocDto = {
        docId: 'doc123',
        ownerId: '11111111111111111',
        title: 'Test Document Version 3',
        content: 'This is the third version of the test document.',
        revision: 3,
        collaborators: [],
      };

      const createdDocVersion = {
        ...docDto,
      };

      mockDocVersionModel.create.mockResolvedValueOnce(createdDocVersion);

      const result = await repository.create(docDto);

      expect(result).toBe(createdDocVersion);
      expect(model.create).toHaveBeenCalledWith(docDto);
    });
  });

  describe('findByDocId', () => {
    it('should return all versions of a document when found', async () => {
      const docId = 'doc123';
      const expectedVersions = mockDocVersions;

      mockDocVersionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(expectedVersions),
      });

      const result = await repository.findByDocId(docId);

      expect(result).toBe(expectedVersions);
      expect(model.find).toHaveBeenCalledWith({ docId });
    });

    it('should throw NotFoundException when no versions are found', async () => {
      const docId = 'nonexistent';

      mockDocVersionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([]),
      });

      await expect(repository.findByDocId(docId)).rejects.toThrow(
        NotFoundException
      );
      expect(model.find).toHaveBeenCalledWith({ docId });
    });
  });
});
