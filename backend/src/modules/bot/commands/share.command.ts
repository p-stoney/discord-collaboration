import { Command, Handler, IA } from '@discord-nestjs/core';
import { Injectable, UseFilters, ForbiddenException } from '@nestjs/common';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import { Message, TextChannel } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';

@Command({
  name: 'share',
  description: 'Share a document with other users',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
export class ShareCommand {
  constructor(
    private readonly docService: DocService,
    private readonly permissionsService: PermissionsService
  ) {}

  @Handler()
  async onShare(@IA() interaction: CommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const channel = interaction.channel as TextChannel;

    if (!channel) {
      await interaction.reply({
        content: 'An error occurred: Unable to access the channel.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: 'Please enter the Document ID you wish to share:',
      ephemeral: true,
    });

    try {
      const { response: docIdResponse, content: docId } =
        await this.collectResponse(interaction, channel, userId);

      await docIdResponse.delete();

      const hasPermission = await this.permissionsService.hasPermission(
        docId,
        userId,
        DocumentPermission.ADMIN
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `You do not have ${DocumentPermission.ADMIN.toLowerCase()} access to this document.`
        );
      }

      await interaction.followUp({
        content:
          'Please mention the users you want to share the document with (e.g., @User1 @User2):',
        ephemeral: true,
      });

      const { response: usersResponse, content: usersContent } =
        await this.collectResponse(interaction, channel, userId);

      await usersResponse.delete();

      const userMentions = usersContent.match(/<@!?(\d+)>/g);

      if (!userMentions || userMentions.length === 0) {
        await interaction.followUp({
          content: 'No users were mentioned. Please try the command again.',
          ephemeral: true,
        });
        return;
      }

      const userIds = userMentions.map((mention) =>
        mention.replace(/<@!?(\d+)>/, '$1')
      );

      await interaction.followUp({
        content:
          'Please specify the permission level (`READ`, `WRITE`, or `ADMIN`):',
        ephemeral: true,
      });

      const { response: permissionResponse, content: permissionContent } =
        await this.collectResponse(interaction, channel, userId);

      await permissionResponse.delete();

      const permission = permissionContent.toUpperCase() as DocumentPermission;

      if (!Object.values(DocumentPermission).includes(permission)) {
        await interaction.followUp({
          content:
            'Invalid permission level provided. Please try the command again.',
          ephemeral: true,
        });
        return;
      }

      await this.docService.addCollaborators({
        docId,
        users: userIds,
        permission,
      });

      await Promise.all(
        userIds.map(async (targetUserId) => {
          try {
            const discordUser =
              await interaction.client.users.fetch(targetUserId);
            await discordUser.send(
              `You have been granted ${permission} access to document "${docId}".`
            );
          } catch (error) {
            console.error(`Could not send DM to user ${targetUserId}:`, error);
          }
        })
      );

      await interaction.followUp({
        content: `Document "${docId}" shared successfully with users: ${userIds.join(', ')}.`,
        ephemeral: true,
      });
    } catch (error) {
      if (error instanceof ForbiddenException) {
        await interaction.followUp({
          content: error.message,
          ephemeral: true,
        });
      } else if (error instanceof Error && error.message === 'time') {
        await interaction.followUp({
          content:
            'You did not respond in time (30 seconds). Please try the command again.',
          ephemeral: true,
        });
      } else {
        console.error('An error occurred:', error);
        await interaction.followUp({
          content: 'An unexpected error occurred. Please try again later.',
          ephemeral: true,
        });
      }
    }
  }

  private async collectResponse(
    interaction: CommandInteraction,
    channel: TextChannel,
    userId: string
  ): Promise<{ response: Message; content: string }> {
    const filter = (response: Message) => response.author.id === userId;

    const collected = await channel.awaitMessages({
      filter,
      max: 1,
      time: 30000,
      errors: ['time'],
    });

    const response = collected.first();
    const content = response?.content.trim() || '';

    return { response, content };
  }
}
