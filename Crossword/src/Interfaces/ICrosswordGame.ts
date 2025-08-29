import { TDirection } from "../Types/TDirection";
import { IClue } from "./IClue";
import { IWord } from "./IWord";

export interface ICrosswordGame {
  get rows(): number;
  get cols(): number;
  setCharAt(col: number, row: number, char: string): void;
  isSolved(): boolean;
  getIncorrectCharacters(): Array<{ col: number; row: number; }>;
  intersectsWord(col: number, row: number): boolean;
  getClues(): IClue[];
  getWord(row: number, col: number, direction: TDirection): IWord | undefined;
}
