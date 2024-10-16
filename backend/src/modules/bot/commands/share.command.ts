import { Command, Handler, IA } from '@discord-nestjs/core';
import { Injectable, UseFilters, ForbiddenException } from '@nestjs/common';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { ShareDocumentDto } from './dtos';
import { CommandInteraction } from 'discord.js';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';

@Command({
  name: 'share',
  description:
    '/share <docId> <users> <permission> - Share a document with users',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
export class ShareCommand {
  constructor(
    private readonly docService: DocService,
    private readonly permissionsService: PermissionsService
  ) {}

  @Handler()
  async onShareDocument(
    @IA(SlashCommandPipe) dto: ShareDocumentDto,
    interaction: CommandInteraction
  ): Promise<void> {
    const discordId = interaction.user.id;
    const { docId, users, permission } = dto;

    const hasPermission = await this.permissionsService.hasPermission(
      docId,
      discordId,
      DocumentPermission.ADMIN
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `You do not have ${DocumentPermission.ADMIN.toLowerCase()} access to this document.`
      );
    }

    await this.docService.addCollaborators({
      docId,
      users,
      permission,
    });

    await Promise.all(
      users.map(async (userId) => {
        try {
          const discordUser = await interaction.client.users.fetch(userId);
          await discordUser.send(
            `You have been granted ${permission} access to document "${docId}".`
          );
        } catch (error) {
          console.error(`Could not send DM to user ${userId}:`, error);
        }
      })
    );

    await interaction.reply({
      content: `Document "${docId}" shared successfully with users: ${users.join(', ')}.`,
      ephemeral: true,
    });
  }
}
