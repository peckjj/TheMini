import { ICrosswordGame } from "../Interfaces/ICrosswordGame";
import { ICrossword } from "../Interfaces/ICrossword";

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

    setCharAt(x: number, y: number, char: string): void {
        this.board.setCharAt(x, y, char);
    }

    isSolved(): boolean {
        return this.getIncorrectCharacters().length === 0;
    }

    getIncorrectCharacters(): Array<{ x: number; y: number; }> {
        const incorrect: Array<{ x: number; y: number; }> = [];
        for (let x = 0; x < this.board.cols; x++) {
            for (let y = 0; y < this.board.rows; y++) {
                if (this.board.intersectsWord(x, y)) {
                    const boardChar = (this.board as any).getCharAt(x, y);
                    const keyChar = (this.key as any).getCharAt(x, y);
                    if (boardChar !== keyChar) {
                        incorrect.push({ x, y });
                    }
                }
            }
        }
        return incorrect;
    }
}
