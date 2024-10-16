import { registerAs } from '@nestjs/config';

export default registerAs('bot', () => ({
  discordToken: process.env.DISCORD_BOT_TOKEN,
}));
