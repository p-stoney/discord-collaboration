import { Injectable, Scope } from '@nestjs/common';
import { Filter, InteractionEventCollector, On } from '@discord-nestjs/core';
import { StringSelectMenuInteraction } from 'discord.js';
import { ShareService } from '../services';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({ time: 60000 })
export class UserSelectCollector {
  constructor(private readonly shareService: ShareService) {}

  @Filter()
  async filter(interaction: StringSelectMenuInteraction): Promise<boolean> {
    return interaction.customId === 'userSelect';
  }

  @On('collect')
  async onCollect(interaction: StringSelectMenuInteraction): Promise<void> {
    try {
      this.shareService.updateSelection('users', interaction.values);
      await interaction.update({
        content: `Users selected: ${interaction.values.join(', ')}`,
        components: interaction.message.components,
      });
    } catch (error) {
      console.error('Error during user selection:', error);
      await interaction.update({
        content: 'An error occurred while selecting users. Please try again.',
        components: interaction.message.components,
      });
    }
  }

  @On('end')
  onEnd(): void {
    console.log('User select interaction collector ended.');
  }
}
