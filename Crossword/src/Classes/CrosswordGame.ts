import { ICrosswordGame } from "../Interfaces/ICrosswordGame";
import { ICrossword } from "../Interfaces/ICrossword";
import { IClue } from "../Interfaces/IClue";
import { IWord } from "../Interfaces/IWord";
import { TDirection } from "../Types/TDirection";

export class CrosswordGame implements ICrosswordGame {
    private key: ICrossword;
    private board: ICrossword;
    private _rows: number;
    private _cols: number;


    constructor(key: ICrossword) {
        this.key = key;
        this.board = key.createBlankCopy();
        this._rows = this.key.rows;
        this._cols = this.key.cols;
    }

    get rows(): number {
        return this._rows;
    }

    get cols(): number {
        return this._cols;
    }

    setCharAt(row: number, col: number, char: string): void {
        this.board.setCharAt(row, col, char);
    }

    isSolved(): boolean {
        return this.getIncorrectCharacters().length === 0;
    }

    getIncorrectCharacters(): Array<{ row: number; col: number; }> {
        const incorrect: Array<{ row: number; col: number; }> = [];
        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols; col++) {
                if (this.board.intersectsWord(row, col)) {
                    const boardChar = (this.board as any).getCharAt(row, col);
                    const keyChar = (this.key as any).getCharAt(row, col);
                    if (boardChar !== keyChar) {
                        incorrect.push({ row, col });
                    }
                }
            }
        }
        return incorrect;
    }

    intersectsWord(row: number, col: number): boolean {
        return this.board.intersectsWord(row, col);
    }

    getClues(): IClue[] {
        return this.key.getClues();
    }

    getWord(row: number, col: number, direction: TDirection): IWord | undefined {
        return this.board.getWord(row, col, direction);
    }

    getCharAt(row: number, col: number): string | undefined {
        return this.board.getCharAt(row, col);
    }
}
