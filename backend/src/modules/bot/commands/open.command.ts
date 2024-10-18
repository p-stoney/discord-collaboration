import { Command, Handler, IA } from '@discord-nestjs/core';
import { Injectable, UseFilters, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import { CommandInteraction, Message, TextChannel } from 'discord.js';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';

@Command({
  name: 'open',
  description: 'Open a document for editing',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
export class OpenCommand {
  constructor(
    private readonly configService: ConfigService,
    private readonly docService: DocService,
    private readonly permissionsService: PermissionsService
  ) {}

  @Handler()
  async onOpen(@IA() interaction: CommandInteraction): Promise<void> {
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
      content: 'Please enter the Document ID you wish to open:',
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
          `You do not have access to this document.`
        );
      }

      const document = await this.docService.findByDocId(docId);

      if (!document) {
        throw new ForbiddenException(`Document with ID "${docId}" not found.`);
      }

      const baseUrl = this.configService.get<string>('auth.appBaseUrl');
      const documentLink = `${baseUrl}/document/${docId}`;

      await interaction.followUp({
        content: `You can edit the document here: ${documentLink}`,
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
