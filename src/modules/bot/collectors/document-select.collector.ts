import { Injectable, Scope } from '@nestjs/common';
import { Filter, InteractionEventCollector, On } from '@discord-nestjs/core';
import { StringSelectMenuInteraction } from 'discord.js';
import { ShareService } from '../services';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({ time: 60000 })
export class DocumentSelectCollector {
  constructor(private readonly shareService: ShareService) {}

  @Filter()
  async filter(interaction: StringSelectMenuInteraction): Promise<boolean> {
    return interaction.customId === 'documentSelect';
  }

  @On('collect')
  async onCollect(interaction: StringSelectMenuInteraction): Promise<void> {
    try {
      this.shareService.updateSelection('document', interaction.values[0]);
      await interaction.update({
        content: `Document selected: ${interaction.values[0]}`,
        components: interaction.message.components,
      });
    } catch (error) {
      console.error('Error during document selection:', error);
      await interaction.update({
        content:
          'An error occurred while selecting the document. Please try again.',
        components: interaction.message.components,
      });
    }
  }

  @On('end')
  onEnd(): void {
    console.log('Document select interaction collector ended.');
  }
}
