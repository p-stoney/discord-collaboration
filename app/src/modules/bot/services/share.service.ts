import { Injectable } from '@nestjs/common';
import { StringSelectMenuInteraction } from 'discord.js';
import { DocService } from '../../doc/services/doc.service';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';
import { MissingSelectionsException } from '../errors/MissingSelectionsException';

@Injectable()
export class ShareService {
  private selectedDocId: string;
  private selectedUsers: string[] = [];
  private selectedPermission: string;

  constructor(private readonly docService: DocService) {}

  updateSelection(type: string, value: string | string[]) {
    if (type === 'document') {
      this.selectedDocId = value as string;
    } else if (type === 'users') {
      this.selectedUsers = value as string[];
    } else if (type === 'permission') {
      this.selectedPermission = value as string;
    }
  }

  areAllSelectionsMade(): boolean {
    return (
      !!this.selectedDocId &&
      !!this.selectedPermission &&
      this.selectedUsers.length > 0
    );
  }

  validateSelections(): void {
    if (!this.selectedDocId) {
      throw new MissingSelectionsException('Document is not selected.');
    }

    if (this.selectedUsers.length === 0) {
      throw new MissingSelectionsException('No users selected.');
    }

    if (!this.selectedPermission) {
      throw new MissingSelectionsException('Permission is not selected.');
    }
  }

  async shareDocument(interaction: StringSelectMenuInteraction): Promise<void> {
    this.validateSelections();

    await this.docService.addCollaborators({
      docId: this.selectedDocId,
      users: this.selectedUsers,
      permission: this.selectedPermission as DocumentPermission,
    });

    await Promise.all(
      this.selectedUsers.map(async (targetUserId) => {
        try {
          const discordUser =
            await interaction.client.users.fetch(targetUserId);
          await discordUser.send(
            `You have been granted ${this.selectedPermission} access to document "${this.selectedDocId}".`
          );
        } catch (error) {
          console.error(`Could not send DM to user ${targetUserId}:`, error);
        }
      })
    );
  }
}
