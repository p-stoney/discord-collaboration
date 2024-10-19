import { Injectable, NotFoundException } from '@nestjs/common';
import { DocRepository, DocVersionRepository } from '../repositories';
import { DocDocument } from '../schemas/doc.schema';
import { DocumentPermission } from '../enums/doc-permission.enum';
import {
  CollaboratorDto,
  CreateDocDto,
  UpdateDocDto,
  AddCollaboratorsDto,
} from '../dtos';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocService {
  constructor(
    private readonly repository: DocRepository,
    private readonly versionRepository: DocVersionRepository
  ) {}
  /**
   * Finds a document by its ID.
   * @param docId - The unique identifier of the document.
   * @returns The document if found.
   * @throws NotFoundException if the document does not exist.
   */
  async findByDocId(docId: string): Promise<DocDocument> {
    const doc = await this.repository.findByDocId(docId);
    if (!doc) {
      throw new NotFoundException(`Document with ID ${docId} not found`);
    }
    return doc;
  }

  /**
   * Retrieves all documents owned by a specific user.
   * @param ownerId - The Discord ID of the owner.
   * @returns An array of documents.
   * @throws NotFoundException if no documents are found.
   */
  async findAllByOwner(ownerId: string): Promise<DocDocument[]> {
    const docs = await this.repository.findAllByOwner(ownerId);
    if (!docs || docs.length === 0) {
      throw new NotFoundException(`No documents found for owner ID ${ownerId}`);
    }
    return docs;
  }

  /**
   * Retrieves all documents where the user is a collaborator.
   * @param discordId - The Discord ID of the user.
   * @returns An array of documents.
   * @throws NotFoundException if no documents are found.
   */
  async findAllByCollaborator(discordId: string): Promise<DocDocument[]> {
    const docs = await this.repository.findAllByCollaborator(discordId);
    if (!docs || docs.length === 0) {
      throw new NotFoundException(
        `No documents found where user is a collaborator`
      );
    }
    return docs;
  }

  /**
   * Creates a new document.
   * @param createDocDto - The data transfer object containing document details.
   * @returns The created document.
   */
  async create(createDocDto: CreateDocDto): Promise<DocDocument> {
    const newDocData = {
      ...createDocDto,
      docId: uuidv4(),
      content: createDocDto.content || '',
      revision: 1,
      collaborators: [
        {
          discordId: createDocDto.ownerId,
          permission: DocumentPermission.ADMIN,
        },
      ],
    };

    const createdDoc = await this.repository.create(newDocData);

    const versionData = createdDoc.toObject();
    delete versionData._id;

    await this.versionRepository.create(versionData);

    return createdDoc;
  }

  /**
   * Updates an existing document and creates a new version.
   * @param updateDocDto - The data transfer object containing updated details.
   * @returns The updated document.
   */
  async update(updateDocDto: UpdateDocDto): Promise<DocDocument> {
    const existingDoc = await this.findByDocId(updateDocDto.docId);

    const updatedDocData = {
      ...existingDoc.toObject(),
      ...updateDocDto.updatedDetails,
      revision: existingDoc.revision + 1,
    };

    const updatedDoc = await this.repository.update(
      updateDocDto.docId,
      updatedDocData
    );

    const versionData = updatedDoc.toObject();
    delete versionData._id;

    await this.versionRepository.create(versionData);

    return updatedDoc;
  }

  /**
   * Adds or updates collaborators on a document.
   * @param addCollaboratorsDto - The data transfer object containing collaborator details.
   * @returns The updated document.
   */
  async addCollaborators(
    addCollaboratorsDto: AddCollaboratorsDto
  ): Promise<DocDocument> {
    const existingDoc = await this.findByDocId(addCollaboratorsDto.docId);

    const updatedCollaborators: CollaboratorDto[] =
      existingDoc.collaborators.map((collaborator) => {
        const discordId = collaborator.discordId;
        if (addCollaboratorsDto.users.includes(discordId)) {
          return {
            discordId,
            permission: addCollaboratorsDto.permission,
          };
        }
        return {
          discordId,
          permission: collaborator.permission,
        };
      });

    const existingUserIds = updatedCollaborators.map(
      (collaborator) => collaborator.discordId
    );

    const newCollaborators = addCollaboratorsDto.users
      .filter((discordId) => !existingUserIds.includes(discordId))
      .map((discordId) => ({
        discordId,
        permission: addCollaboratorsDto.permission,
      }));

    const allCollaborators = [...updatedCollaborators, ...newCollaborators];

    const updatedDoc = await this.update({
      docId: addCollaboratorsDto.docId,
      updatedDetails: { collaborators: allCollaborators },
    });

    return updatedDoc;
  }
}
