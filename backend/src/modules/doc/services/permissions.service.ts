import { Injectable } from '@nestjs/common';
import { DocService } from './doc.service';
import { DocumentPermission } from '../enums/doc-permission.enum';

@Injectable()
export class PermissionsService {
  constructor(private readonly docService: DocService) {}

  /**
   * Finds the permission level of a user for a specific document.
   * @param docId - The unique identifier of the document.
   * @param discordId - The Discord ID of the user.
   * @returns The permission level of the user for the document or null if the user is not a collaborator.
   */
  async findPermission(
    docId: string,
    discordId: string
  ): Promise<DocumentPermission | null> {
    const document = await this.docService.findByDocId(docId);

    if (document.ownerId === discordId) {
      return DocumentPermission.ADMIN;
    }

    const collaborator = document.collaborators.find(
      (c) => c.discordId === discordId
    );

    return collaborator ? collaborator.permission : null;
  }

  /**
   * Checks if a user has the required permission level for a document.
   * @param docId - The unique identifier of the document.
   * @param discordId - The Discord ID of the user.
   * @param requiredPermission - The required permission level.
   * @returns True if the user has the required permission level, false otherwise.
   */
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
