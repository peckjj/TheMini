import { IClue } from './IClue';

export interface ICrossword {
  get rows(): number;
  get cols(): number;
  getClues(): IClue[];
  createBlankCopy(): ICrossword;
  createFullCopy(): ICrossword;
  intersectsWord(col: number, row: number): boolean;
  setCharAt(col: number, row: number, char: string): void;
  getCharAt(col: number, row: number): string | undefined;
}
