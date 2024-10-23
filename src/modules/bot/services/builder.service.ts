import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { DocService } from '../../doc/services';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';

@Injectable()
export class BuilderService {
  constructor(private readonly docService: DocService) {}

  async buildDocumentMenu(userId: string) {
    try {
      const documents = await this.docService.findAllByCollaborator(userId);
      const options = documents.map((doc) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(doc.title)
          .setValue(doc.docId)
      );

      return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('documentSelect')
          .setPlaceholder('Select a document')
          .addOptions(options)
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new Error('No documents found for this user.');
      }
      throw error;
    }
  }

  buildUserMenu() {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new UserSelectMenuBuilder()
        .setCustomId('userSelect')
        .setPlaceholder('Select users to share with')
        .setMinValues(1)
        .setMaxValues(5)
    );
  }

  buildPermissionMenu() {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('permissionSelect')
        .setPlaceholder('Select a permission level')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Read')
            .setValue(DocumentPermission.READ),
          new StringSelectMenuOptionBuilder()
            .setLabel('Write')
            .setValue(DocumentPermission.WRITE),
          new StringSelectMenuOptionBuilder()
            .setLabel('Admin')
            .setValue(DocumentPermission.ADMIN)
        )
    );
  }

  buildSubmitButton() {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('submitButton')
        .setLabel('Submit')
        .setStyle(ButtonStyle.Primary)
    );
  }
}
