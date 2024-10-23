import {
  Filter,
  InjectCauseEvent,
  InteractionEventCollector,
  On,
} from '@discord-nestjs/core';
import { Injectable, Scope } from '@nestjs/common';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';
import { ShareService } from '../services';
import { MissingSelectionsException } from '../errors/MissingSelectionsException';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({ time: 15000 })
export class SubmitButtonCollector {
  constructor(
    @InjectCauseEvent()
    private readonly causeInteraction: ChatInputCommandInteraction,
    private readonly shareService: ShareService
  ) {}

  @Filter()
  async filter(interaction: ButtonInteraction): Promise<boolean> {
    await interaction.deferReply({ ephemeral: true });
    return this.causeInteraction.id === interaction.message.id;
  }

  @On('collect')
  async onCollect(interaction: ButtonInteraction): Promise<void> {
    try {
      // await interaction.deferReply({ ephemeral: true });
      // await this.shareService.shareDocument(interaction);

      await interaction.editReply({
        content: `Document shared successfully.`,
        components: [],
      });
    } catch (error) {
      if (error instanceof MissingSelectionsException) {
        await interaction.editReply({
          content: error.message,
          components: [],
        });
      } else {
        console.error('Unexpected error during sharing:', error);
        await interaction.editReply({
          content: 'An unexpected error occurred. Please try again later.',
          components: [],
        });
      }
    }
  }

  @On('end')
  onEnd(): void {
    console.log('Interaction collector ended.');
  }
}
