export class CWEmptyWordError extends Error {
  constructor(message: string = "Word cannot be empty") {
    super(message);
    this.name = "CWEmptyWordError";
  }
}
