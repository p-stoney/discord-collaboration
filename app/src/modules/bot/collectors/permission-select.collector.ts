import { Injectable, Scope } from '@nestjs/common';
import { Filter, InteractionEventCollector, On } from '@discord-nestjs/core';
import { StringSelectMenuInteraction } from 'discord.js';
import { ShareService } from '../services';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({ time: 60000 })
export class PermissionSelectCollector {
  constructor(private readonly shareService: ShareService) {}

  @Filter()
  async filter(interaction: StringSelectMenuInteraction): Promise<boolean> {
    return interaction.customId === 'permissionSelect';
  }

  @On('collect')
  async onCollect(interaction: StringSelectMenuInteraction): Promise<void> {
    try {
      this.shareService.updateSelection('permission', interaction.values[0]);

      await interaction.update({
        content: `Permission selected: ${interaction.values[0]}`,
        components: interaction.message.components,
      });

      if (this.shareService.areAllSelectionsMade()) {
        await this.shareService.shareDocument(interaction);

        await interaction.followUp({
          content: `Document shared successfully.`,
          components: [],
        });
      }
    } catch (error) {
      console.error('Error during permission selection:', error);
      await interaction.followUp({
        content:
          'An error occurred while selecting permission. Please try again.',
        components: interaction.message.components,
        ephemeral: true,
      });
    }
  }

  @On('end')
  onEnd(): void {
    console.log('Permission select interaction collector ended.');
  }
}
