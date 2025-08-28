export interface ICrosswordGame {
  get rows(): number;
  get cols(): number;
  setCharAt(x: number, y: number, char: string): void;
  isSolved(): boolean;
  getIncorrectCharacters(): Array<{ x: number; y: number; }>;
}
