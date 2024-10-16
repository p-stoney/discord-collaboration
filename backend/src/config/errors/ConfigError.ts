export class ConfigError extends Error {
  constructor(variableName: string) {
    super(
      `${variableName} is not defined. Check your environment configuration.`
    );
    this.name = 'ConfigError';
  }
}
