import { Word } from '../Classes/Word';

export interface IDictionaryRepo {
  getRandomWord(length?: number): Promise<{ id: number; text: string }>;
  getRandomWords(count: number, length?: number): Promise<{ id: number; text: string }[]>;
}
