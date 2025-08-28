import { IClue } from './IClue';

export interface ICrossword {
  get rows(): number;
  get cols(): number;
  getClues(): IClue[];
  createBlankCopy(): ICrossword;
  createFullCopy(): ICrossword;
  intersectsWord(x: number, y: number): boolean;
  setCharAt(x: number, y: number, char: string): void;
  getCharAt(x: number, y: number): string | undefined;
}
