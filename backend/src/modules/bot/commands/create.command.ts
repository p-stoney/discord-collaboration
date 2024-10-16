import { Command, Handler, IA } from '@discord-nestjs/core';
import { Injectable, UseFilters } from '@nestjs/common';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { CreateDocumentDto } from './dtos';
import { CommandInteraction } from 'discord.js';
import { DocService } from '../../doc/services/doc.service';

@Command({
  name: 'create',
  description: '/create <title> - Create a new document',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
export class CreateCommand {
  constructor(private readonly docService: DocService) {}

  @Handler()
  async onCreateDocument(
    @IA(SlashCommandPipe) dto: CreateDocumentDto,
    interaction: CommandInteraction
  ): Promise<void> {
    const discordId = interaction.user.id;
    const { title } = dto;

    await this.docService.create({
      ownerId: discordId,
      title,
      content: '',
    });

    await interaction.reply({
      content: `Document "${title}" created successfully.`,
      ephemeral: true,
    });
  }
}
