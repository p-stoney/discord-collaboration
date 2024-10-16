import { ConfigService } from '@nestjs/config';
import { ConfigError } from '../config/errors/ConfigError';

export function getEnvVariable(
  configService: ConfigService,
  key: string
): string {
  const value = configService.get<string>(key);
  if (!value) {
    throw new ConfigError(key);
  }
  return value;
}
