import { Word } from '../Classes/Word';

export interface IDictionaryRepo {
  getRandomWord(length?: number): Word;
  getRandomWords(count: number, length?: number): Word[];
}
