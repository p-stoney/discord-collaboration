import {
  ForbiddenException,
  NotFoundException,
  Catch,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { Interaction, EmbedBuilder, Colors } from 'discord.js';

/**
 * Exception filter that handles exceptions in Discord bot commands and replies with an error embed.
 */
@Catch(ForbiddenException, NotFoundException)
export class CommandExceptionFilter implements ExceptionFilter {
  /**
   * Catches exceptions and sends an error embed as a reply to the Discord interaction.
   * @param exception - The caught exception (`ForbiddenException` or `NotFoundException`).
   * @param host - The current execution context.
   */
  async catch(
    exception: ForbiddenException | NotFoundException,
    host: ArgumentsHost
  ) {
    const interaction: Interaction = host.getArgByIndex(0);

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('Error')
      .setDescription(exception.message);

    if (interaction.isRepliable()) {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
