import { TDirection } from '../Types/TDirection';

export interface IClue {
    get text(): string;
    direction: TDirection;
    order: number;
}
