
import { IWord } from '../Interfaces/IWord';
import { ICrossword } from '../Interfaces/ICrossword';
import { IClue } from '../Interfaces/IClue';
import { CWInvalidDimsError } from '../Errors/CWInvalidDimsError';

export class Crossword implements ICrossword {
    getCharAt(x: number, y: number): string | undefined {
        for (const word of this._words) {
            if (word.direction === 'across') {
                if (y === word.row && x >= word.col && x < word.col + word.length) {
                    return word.text[x - word.col];
                }
            } else if (word.direction === 'down') {
                if (x === word.col && y >= word.row && y < word.row + word.length) {
                    return word.text[y - word.row];
                }
            }
        }
        return undefined;
    }
    private _words: IWord[];
    private _rows: number = 0 ;
    private _cols: number = 0;

    constructor(words: IWord[]) {
        this._words = words;
        this.calculateMaxRowsAndCols();

        console.log(this._rows, this._cols);
    }

    private calculateMaxRowsAndCols(): void {
        this._rows = Math.max(...this._words.map(word => word.row + (word.direction === 'down' ? word.length : 1)));
        this._cols = Math.max(...this._words.map(word => word.col + (word.direction === 'across' ? word.length : 1)));
    }

    get rows(): number {
        return this._rows;
    }

    get cols(): number {
        return this._cols;
    }

    setCharAt(x: number, y: number, char: string): void {
        // Find the word(s) that cover (x, y)
        for (const word of this._words) {
            if (word.direction === 'across') {
                if (y === word.row && x >= word.col && x < word.col + word.length) {
                    word.setCharAt(x - word.col, char);
                }
            } else if (word.direction === 'down') {
                if (x === word.col && y >= word.row && y < word.row + word.length) {
                    word.setCharAt(y - word.row, char);
                }
            }
        }
    }

    /**
     * Checks if any word in the crossword intersects the given cell (x, y).
     * Returns true if at least one word covers the cell, otherwise false.
     */
    intersectsWord(x: number, y: number): boolean {
        return this._words.some(word => {
            if (word.direction === 'across') {
                return (
                    y === word.row &&
                    x >= word.col &&
                    x < word.col + word.length
                );
            }
            return (
                x === word.col &&
                y >= word.row &&
                y < word.row + word.length
            );
        });
    }

    getClues(): IClue[] {
        return this._words.map((word) => word.clue);
    }

    createBlankCopy(): ICrossword {
        // Use blankCopy method of IWord
        const blankWords = this._words.map(word => word.blankCopy());
        return new Crossword(blankWords);
    }

    createFullCopy(): ICrossword {
        // Use copy method of IWord
        const fullWords = this._words.map(word => word.copy());
        return new Crossword(fullWords);
    }
}