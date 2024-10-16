import { Injectable, NotFoundException } from '@nestjs/common';
import { DocService } from './doc.service';
import { DocumentPermission } from '../enums/doc-permission.enum';

@Injectable()
export class PermissionsService {
  constructor(private readonly docService: DocService) {}

  async findPermission(
    docId: string,
    discordId: string
  ): Promise<DocumentPermission | null> {
    const document = await this.docService.findByDocId(docId);

    if (!document) {
      throw new NotFoundException(`Document with ID ${docId} not found.`);
    }

    if (document.ownerId === discordId) {
      return DocumentPermission.ADMIN;
    }

    const collaborator = document.collaborators.find(
      (c) => c.discordId === discordId
    );

    return collaborator ? collaborator.permission : null;
  }

  async hasPermission(
    docId: string,
    discordId: string,
    requiredPermission: DocumentPermission
  ): Promise<boolean> {
    const userPermission = await this.findPermission(docId, discordId);

    if (!userPermission) {
      return false;
    }

    const permissionLevels = {
      [DocumentPermission.READ]: 1,
      [DocumentPermission.WRITE]: 2,
      [DocumentPermission.ADMIN]: 3,
    };

    return (
      permissionLevels[userPermission] >= permissionLevels[requiredPermission]
    );
  }
}
