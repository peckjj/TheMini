import { IClue } from '../Interfaces/IClue';
import { TDirection } from '../Types/TDirection';

export class Clue implements IClue {
    private readonly _text: string;
    direction: TDirection;
    order: number;

    constructor(text: string, direction: TDirection = "across", order: number = 0) {
        this._text = text;
        this.direction = direction;
        this.order = order;
    }

    get text(): string {
        return this._text;
    }
}
