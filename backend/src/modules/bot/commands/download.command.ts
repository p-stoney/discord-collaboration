import { Command, Handler, IA } from '@discord-nestjs/core';
import { Injectable, UseFilters, ForbiddenException } from '@nestjs/common';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { DownloadDocumentDto } from './dtos';
import { CommandInteraction, AttachmentBuilder } from 'discord.js';
import { DocService } from '../../doc/services/doc.service';
import { PermissionsService } from '../../doc/services/permissions.service';
import { DocumentPermission } from '../../doc/enums/doc-permission.enum';

@Command({
  name: 'download',
  description: '/download <docId> to download a copy of the document',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
export class DownloadCommand {
  constructor(
    private readonly docService: DocService,
    private readonly permissionsService: PermissionsService
  ) {}

  @Handler()
  async onDownloadDocument(
    @IA(SlashCommandPipe) dto: DownloadDocumentDto,
    interaction: CommandInteraction
  ): Promise<void> {
    const discordId = interaction.user.id;
    const { docId } = dto;

    const hasPermission = await this.permissionsService.hasPermission(
      docId,
      discordId,
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

    await interaction.reply({
      content: `Here is your document "${document.title}":`,
      files: [attachment],
      ephemeral: true,
    });
  }
}
