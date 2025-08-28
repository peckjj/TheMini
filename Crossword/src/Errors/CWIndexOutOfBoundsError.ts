export class CWIndexOutOfBoundsError extends Error {
  constructor(message: string = "Index out of bounds for Word") {
    super(message);
    this.name = "CWIndexOutOfBoundsError";
  }
}
