import { IWord } from "../Interfaces/IWord";
import { CWIndexOutOfBoundsError } from "../Errors/CWIndexOutOfBoundsError";
import { CWInvalidCharLengthError } from "../Errors/CWInvalidCharLengthError";
import { CWInvalidCharTypeError } from "../Errors/CWInvalidCharTypeError";
import { IClue } from "../Interfaces/IClue";
import { TDirection } from "../Types/TDirection";
import { CWEmptyWordError } from "../Errors/CWEmptyWordError";

const BLANK_CHAR = '_';

export class Word implements IWord {
    private _text: string;
    private readonly _clue: IClue;
    private readonly _row: number;
    private readonly _col: number;
    private readonly _direction: TDirection;
    private readonly _length: number;

    constructor(
        text: string,
        clue: IClue,
        row: number,
        col: number,
        direction: TDirection,
    ) {
        if (!text || text.length === 0) {
            throw new CWEmptyWordError();
        }

        this._text = text;
        this._row = row;
        this._col = col;
        this._direction = direction;
        this._length = text.length;
        this._clue = clue;
        // Set clue direction and order based on word
        const order = direction === "across" ? row : col;
        this._clue.direction = direction;
        this._clue.order = order;
    }

    get text(): string {
        return '' + this._text;
    }
    get row(): number {
        return this._row;
    }
    get col(): number {
        return this._col;
    }
    get direction(): TDirection {
        return this._direction;
    }
    get length(): number {
        return this._length;
    }

    get clue(): IClue {
        return this._clue
    }

    setCharAt(index: number, char: string): void {
        if (index < 0 || index >= this._length) {
            throw new CWIndexOutOfBoundsError();
        }
        if (char.length !== 1) {
            throw new CWInvalidCharLengthError();
        }
        const lowerChar = char.toLowerCase();
        if (!/^[a-z]$/.test(lowerChar)) {
            throw new CWInvalidCharTypeError();
        }
        this._text =
            this._text.substring(0, index) + lowerChar + this._text.substring(index + 1);
    }

    copy(): IWord {
        return new Word(
            this.text,
            this.clue,
            this.row,
            this.col,
            this.direction
        );
    }

    blankCopy(): IWord {
        return new Word(
            BLANK_CHAR.repeat(this.length),
            this.clue,
            this.row,
            this.col,
            this.direction
        );
    }
}
