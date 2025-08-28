export class CWInvalidDimsError extends Error {
  constructor(message: string = "Invalid crossword dimensions") {
    super(message);
    this.name = "CWInvalidDimsError";
  }
}
