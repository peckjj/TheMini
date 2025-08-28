import { IWord } from "../Interfaces/IWord";

export class CWInvalidWordOverlapError extends Error {
  constructor(message: string = "Invalid word overlap", words?: IWord[]) {
    super(message);
    this.name = "CWInvalidWordOverlapError";
  }
}
