export class CWInvalidCharLengthError extends Error {
  constructor(message: string = "Only a single character can be inserted") {
    super(message);
    this.name = "CWInvalidCharLengthError";
  }
}
