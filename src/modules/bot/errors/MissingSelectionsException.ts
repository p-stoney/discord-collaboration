export class MissingSelectionsException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingSelectionsError';
  }
}
