import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  appBaseUrl: process.env.APP_BASE_URL,
  sessionSecret: process.env.SESSION_SECRET,
  secretPassphrase: process.env.SECRET_PASSPHRASE,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
  discordCallbackUrl: process.env.DISCORD_CALLBACK_URL,
}));
