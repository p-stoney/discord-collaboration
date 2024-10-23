import { Command, Handler } from '@discord-nestjs/core';
import { Injectable, UseFilters } from '@nestjs/common';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import { CommandInteraction } from 'discord.js';
import { DocService } from '../../doc/services';

@Command({
  name: 'list',
  description: '/list - List all documents you have access to',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
export class ListCommand {
  constructor(private readonly docService: DocService) {}

  @Handler()
  async onListDocuments(interaction: CommandInteraction): Promise<void> {
    const discordId = interaction.user.id;

    const allDocuments = await this.docService.findAllByCollaborator(discordId);

    const documentList =
      allDocuments.map((doc) => doc.docId + ' : ' + doc.title).join('\n') ||
      'No documents found.';

    await interaction.reply({
      content: `Here are your documents:\n${documentList}`,
      ephemeral: true,
    });
  }
}
