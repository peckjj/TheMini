import { IWord } from "../Interfaces/IWord";

export class CWInvalidWordOverlapError extends Error {
  constructor(message: string = "Invalid word overlap", words?: IWord[]) {
    super(message + "\n" + words?.map(word => ` - ${word.text} (${word.row}, ${word.col})`).join("\n"));
    this.name = "CWInvalidWordOverlapError";
  }
}
