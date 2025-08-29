import { IClue } from './IClue';
import { TDirection } from '../Types/TDirection';

export const BLANK_CHAR = '_';

export interface IWord {
  get id(): number;
  get text(): string;
  get clue(): IClue;
  get row(): number;
  get col(): number;
  get direction(): TDirection;
  get length(): number;
  setCharAt(index: number, char: string): void;
  copy(): IWord;
  blankCopy(): IWord;
}
