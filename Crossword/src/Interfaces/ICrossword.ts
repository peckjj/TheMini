import { TDirection } from '../Types/TDirection';
import { IClue } from './IClue';
import { IWord } from './IWord';

export interface ICrossword {
  get rows(): number;
  get cols(): number;
  getClues(): IClue[];
  createBlankCopy(): ICrossword;
  createFullCopy(): ICrossword;
  intersectsWord(col: number, row: number): boolean;
  setCharAt(col: number, row: number, char: string): void;
  getCharAt(col: number, row: number): string | undefined;
  getWord(row: number, col: number, direction: TDirection): IWord | undefined;
}
