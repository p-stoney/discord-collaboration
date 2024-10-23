import { Command, Handler, IA, UseCollectors } from '@discord-nestjs/core';
import { Injectable, UseFilters, UseInterceptors } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { CollectorInterceptor } from '@discord-nestjs/common';
import { BuilderService } from '../services';
import { CommandExceptionFilter } from '../filters/command-exception.filter';
import {
  DocumentSelectCollector,
  UserSelectCollector,
  PermissionSelectCollector,
} from '../collectors';

@Command({
  name: 'share',
  description: 'Share a document with other users',
})
@Injectable()
@UseFilters(CommandExceptionFilter)
@UseInterceptors(CollectorInterceptor)
@UseCollectors(
  DocumentSelectCollector,
  UserSelectCollector,
  PermissionSelectCollector
)
export class ShareCommand {
  constructor(private readonly builderService: BuilderService) {}

  @Handler()
  async onShare(@IA() interaction: CommandInteraction): Promise<void> {
    try {
      const docSelectRow = await this.builderService.buildDocumentMenu(
        interaction.user.id
      );
      const userSelectRow = this.builderService.buildUserMenu();
      const permissionSelectRow = this.builderService.buildPermissionMenu();

      await interaction.reply({
        content: 'Select share details:',
        components: [docSelectRow, userSelectRow, permissionSelectRow],
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error during share command execution:', error);
      await interaction.reply({
        content:
          'An error occurred while processing your request. Please try again.',
        ephemeral: true,
      });
    }
  }
}
