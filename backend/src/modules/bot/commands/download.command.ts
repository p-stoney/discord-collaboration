import { Command, Handler, IA } from '@discord-nestjs/core';
import { Injectable, UseFilters, ForbiddenException } from '@nestjs/common';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import { CommandInteraction, AttachmentBuilder } from 'discord.js';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';
import { Message, TextChannel } from 'discord.js';

@Command({
  name: 'download',
  description: 'Download a copy of a document',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
export class DownloadCommand {
  constructor(
    private readonly docService: DocService,
    private readonly permissionsService: PermissionsService
  ) {}

  @Handler()
  async onDownload(@IA() interaction: CommandInteraction): Promise<void> {
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
      content: 'Please enter the Document ID you wish to download:',
      ephemeral: true,
    });

    try {
      const { response, content: docId } = await this.collectResponse(
        interaction,
        channel,
        userId
      );

      await response.delete();

      const hasPermission = await this.permissionsService.hasPermission(
        docId,
        userId,
        DocumentPermission.READ
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `You do not have ${DocumentPermission.READ.toLowerCase()} access to this document.`
        );
      }

      const document = await this.docService.findByDocId(docId);

      if (!document) {
        throw new ForbiddenException(`Document with ID "${docId}" not found.`);
      }

      const fileName = `${document.title}.txt`;
      const fileBuffer = Buffer.from(document.content, 'utf-8');
      const attachment = new AttachmentBuilder(fileBuffer, { name: fileName });

      await interaction.followUp({
        content: `Here is your document "${document.title}":`,
        files: [attachment],
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
