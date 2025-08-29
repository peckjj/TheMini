import { IClue } from "./IClue";

export interface ICrosswordGame {
  get rows(): number;
  get cols(): number;
  setCharAt(col: number, row: number, char: string): void;
  isSolved(): boolean;
  getIncorrectCharacters(): Array<{ col: number; row: number; }>;
  intersectsWord(col: number, row: number): boolean;
  getClues(): IClue[];
}
