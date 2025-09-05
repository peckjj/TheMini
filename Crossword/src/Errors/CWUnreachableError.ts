export class CWUnreachableError extends Error {
  constructor(message: string = "Unreachable code executed") {
    super(message);
    this.name = "CWUnreachableError";
  }
}
