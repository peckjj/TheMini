export class CWInvalidCharTypeError extends Error {
  constructor(message: string = "Character must be a letter between a and z") {
    super(message);
    this.name = "CWInvalidCharTypeError";
  }
}
