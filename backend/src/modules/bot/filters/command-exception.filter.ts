import {
  ForbiddenException,
  NotFoundException,
  Catch,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { Interaction, EmbedBuilder, Colors } from 'discord.js';

@Catch(ForbiddenException, NotFoundException)
export class CommandExceptionFilter implements ExceptionFilter {
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
