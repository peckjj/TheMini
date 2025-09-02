export class CWDataError extends Error {
  constructor(message: string = "Database Error...") {
    super(message);
    this.name = "CWDataError";
  }
}
