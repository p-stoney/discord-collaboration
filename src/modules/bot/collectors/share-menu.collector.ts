import { Injectable, Scope } from '@nestjs/common';
import {
  Filter,
  InjectCauseEvent,
  InteractionEventCollector,
  On,
} from '@discord-nestjs/core';
import {
  StringSelectMenuInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { ShareService } from '../services';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({ time: 60000 })
export class ShareMenuCollector {
  constructor(
    @InjectCauseEvent()
    private readonly causeInteraction: ChatInputCommandInteraction,
    private readonly shareService: ShareService
  ) {}

  @Filter()
  async filter(interaction: StringSelectMenuInteraction): Promise<boolean> {
    return this.causeInteraction.id === interaction.message.id;
  }

  @On('collect')
  async onCollect(interaction: StringSelectMenuInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      if (interaction.customId === 'documentSelect') {
        this.shareService.updateSelection('document', interaction.values[0]);
        await interaction.update({
          content: `Document selected: ${interaction.values[0]}`,
          components: interaction.message.components,
        });
      } else if (interaction.customId === 'userSelect') {
        this.shareService.updateSelection('users', interaction.values);
        await interaction.update({
          content: `Users selected: ${interaction.values.join(', ')}`,
          components: interaction.message.components,
        });
      } else if (interaction.customId === 'permissionSelect') {
        this.shareService.updateSelection('permission', interaction.values[0]);
        await interaction.update({
          content: `Permission selected: ${interaction.values[0]}`,
          components: interaction.message.components,
        });

        if (this.shareService.areAllSelectionsMade()) {
          await this.shareService.shareDocument(interaction);
          await interaction.editReply({
            content: `Document shared successfully.`,
            components: [],
          });
        }
      }
    } catch (error) {
      console.error('Error during select menu collection:', error);
      await interaction.update({
        content:
          'An error occurred while processing your selection. Please try again.',
        components: interaction.message.components,
      });
    }
  }

  @On('end')
  onEnd(): void {
    console.log('Select menu interaction collector ended.');
  }
}
