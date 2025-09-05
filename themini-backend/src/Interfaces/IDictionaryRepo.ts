export interface IDictionaryRepo {
  getRandomWord(length?: number): Promise<{ id: number; text: string }>;
  getRandomWords(count: number, length?: number): Promise<{ id: number; text: string }[]>;
  getRandomWordWithPattern(pattern: string): Promise<{ id: number; text: string }>;
  wordExists(pattern: string, maxLength?: number): Promise<boolean>;
}
