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

@Injectable()
export class DocService {
  constructor(
    private readonly repository: DocRepository,
    private readonly versionRepository: DocVersionRepository
  ) {}
  async findByDocId(docId: string): Promise<DocDocument> {
    const doc = await this.repository.findByDocId(docId);
    if (!doc) {
      throw new NotFoundException(`Document with ID ${docId} not found`);
    }
    return doc;
  }

  async findAllByOwner(ownerId: string): Promise<DocDocument[]> {
    const docs = await this.repository.findAllByOwner(ownerId);
    if (!docs || docs.length === 0) {
      throw new NotFoundException(`No documents found for owner ID ${ownerId}`);
    }
    return docs;
  }

  async findAllByCollaborator(discordId: string): Promise<DocDocument[]> {
    const docs = await this.repository.findAllByCollaborator(discordId);
    if (!docs || docs.length === 0) {
      throw new NotFoundException(
        `No documents found where user is a collaborator`
      );
    }
    return docs;
  }

  async create(createDocDto: CreateDocDto): Promise<DocDocument> {
    const newDocData = {
      ...createDocDto,
      docId: `${createDocDto.ownerId}-${Date.now()}`,
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

  async update(updateDocDto: UpdateDocDto): Promise<DocDocument> {
    const existingDoc = await this.findByDocId(updateDocDto.docId);

    if (!existingDoc) {
      throw new NotFoundException(
        `Document with ID ${updateDocDto.docId} not found`
      );
    }

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

  async addCollaborators(
    addCollaboratorsDto: AddCollaboratorsDto
  ): Promise<DocDocument> {
    const existingDoc = await this.findByDocId(addCollaboratorsDto.docId);

    if (!existingDoc) {
      throw new NotFoundException(
        `Document with ID ${addCollaboratorsDto.docId} not found`
      );
    }

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
