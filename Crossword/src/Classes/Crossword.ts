
import { IWord } from '../Interfaces/IWord';
import { ICrossword } from '../Interfaces/ICrossword';
import { IClue } from '../Interfaces/IClue';
import { CWInvalidDimsError } from '../Errors/CWInvalidDimsError';
import { CWIndexOutOfBoundsError } from '../Errors/CWIndexOutOfBoundsError';
import { CWInvalidWordOverlapError } from '../Errors/CWInvalidWordOverlapError';

export class Crossword implements ICrossword {
    private _words: IWord[];
    private _rows: number = 0;
    private _cols: number = 0;

    constructor(words: IWord[]) {
        this._words = words;
        this.calculateMaxRowsAndCols();
        this.validateCrossword();
    }

    private validateCrossword(): void {
        // Initialize a 2D array
        const grid: string[][] = [];
        for (let i = 0; i < this._rows; i++) {
            grid[i] = Array(this._cols).fill(' ');
        }

        // for each word in this crossword, fill the grid with the words letters in the right coordinates.
        // If a letter already exists in a cell, but is not equal to the letter we want to place in it, the
        // crossword is invalid. Throw an InvalidWordOverlap error with a list of the words that overlap.
        const overlappingWords: IWord[] = [];
        for (const word of this._words) {
            if (word.direction === 'across') {
                for (let i = 0; i < word.length; i++) {
                    if (!grid[word.row]?.[word.col]) {
                        throw new CWIndexOutOfBoundsError(`Invalid position at row ${word.row}, col ${word.col} for ${word.text}`);
                    }

                    if (grid[word.row]![word.col + i] !== ' ' && grid[word.row]![word.col + i] !== word.text[i]) {
                        overlappingWords.push(word);
                    }
                    grid[word.row]![word.col + i] = word.text[i]!;
                }
            } else if (word.direction === 'down') {
                for (let i = 0; i < word.length; i++) {
                    if (!grid[word.row + i]?.[word.col]) {
                        throw new CWIndexOutOfBoundsError(`Invalid position at row ${word.row + i}, col ${word.col} for ${word.text}`);
                    }

                    if (grid[word.row + i]![word.col] !== ' ' && grid[word.row + i]![word.col] !== word.text[i]) {
                        overlappingWords.push(word);
                    }
                    grid[word.row + i]![word.col] = word.text[i]!;
                }
            }
        }
        if (overlappingWords.length > 0) {
            throw new CWInvalidWordOverlapError("Overlapping words detected.", overlappingWords);
        }
    }

    getCharAt(row: number, col: number): string | undefined {
        for (const word of this._words) {
            if (word.direction === 'across') {
                if (row === word.row && col >= word.col && col < word.col + word.length) {
                    return word.text[col - word.col];
                }
            } else if (word.direction === 'down') {
                if (col === word.col && row >= word.row && row < word.row + word.length) {
                    return word.text[row - word.row];
                }
            }
        }
        return undefined;
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

    setCharAt(row: number, col: number, char: string): void {
        // Find the word(s) that cover (row, col)
        for (const word of this._words) {
            if (word.direction === 'across') {
                if (row === word.row && col >= word.col && col < word.col + word.length) {
                    word.setCharAt(col - word.col, char);
                }
            } else if (word.direction === 'down') {
                if (col === word.col && row >= word.row && row < word.row + word.length) {
                    word.setCharAt(row - word.row, char);
                }
            }
        }
    }

    /**
     * Checks if any word in the crossword intersects the given cell (x, y).
     * Returns true if at least one word covers the cell, otherwise false.
     */
    intersectsWord(row: number, col: number): boolean {
        return this._words.some(word => {
            if (word.direction === 'across') {
                return (
                    row === word.row &&
                    col >= word.col &&
                    col < word.col + word.length
                );
            }
            return (
                col === word.col &&
                row >= word.row &&
                row < word.row + word.length
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