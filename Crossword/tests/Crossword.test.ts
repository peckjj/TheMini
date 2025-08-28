import { describe, it, expect } from 'vitest';
import { Crossword } from '../src/Classes/Crossword';
import { Word } from '../src/Classes/Word';
import { Clue } from '../src/Classes/Clue';
import { TDirection } from '../src/Types/TDirection';
import { CWInvalidWordOverlapError } from '../src/Errors/CWInvalidWordOverlapError';

function makeWord(text: string, clueText: string, row: number, col: number, direction: TDirection) {
    const clue = new Clue(clueText, direction, direction === 'across' ? row : col);
    return new Word(text, clue, row, col, direction);
}

describe('Crossword', () => {
    it('should create a Crossword with correct properties (1 word across)', () => {
        const words = [makeWord('cat', 'Feline', 0, 0, 'across')];
        const crossword = new Crossword(words);
        expect(crossword.rows).toBe(1);
        expect(crossword.cols).toBe(3);
        expect(crossword.getClues().length).toBe(1);
    });

    it('should create a Crossword with correct properties (1 word down)', () => {
        const words = [makeWord('dog', 'Canine', 0, 0, 'down')];
        const crossword = new Crossword(words);
        expect(crossword.rows).toBe(3);
        expect(crossword.cols).toBe(1);
        expect(crossword.getClues().length).toBe(1);
    });

    it('should create a Crossword with correct properties (3 words across)', () => {
        const words = [
            makeWord('dog', 'Canine', 0, 0, 'across'),
            makeWord('fish', 'Aquatic animal', 1, 0, 'across'),
            makeWord('bat', 'Nocturnal animal', 2, 0, 'across')
        ];
        const crossword = new Crossword(words);
        expect(crossword.rows).toBe(3);
        expect(crossword.cols).toBe(4);
        expect(crossword.getClues().length).toBe(3);
    });

    it('should create a Crossword with correct properties (3 words down)', () => {
        const words = [
            makeWord('dog', 'Canine', 0, 0, 'down'),
            makeWord('Wombat', 'What is a wombat?', 0, 1, 'down'),
            makeWord('ant', 'Insect', 0, 2, 'down')
        ];
        const crossword = new Crossword(words);
        expect(crossword.rows).toBe(6);
        expect(crossword.cols).toBe(3);
        expect(crossword.getClues().length).toBe(3);
    });

    it('should create a Crossword with correct properties (3 words across, 3 words down)', () => {
        const words = [
            makeWord('dog', 'Canine', 0, 0, 'down'),
            makeWord('Wombat', 'What is a wombat?', 0, 1, 'down'),
            makeWord('ant', 'Insect', 0, 2, 'down'),
            makeWord('cat', 'Feline', 1, 0, 'across'),
            makeWord('fish', 'Aquatic animal', 2, 0, 'across'),
            makeWord('bat', 'Nocturnal animal', 3, 0, 'across')
        ];
        const crossword = new Crossword(words);
        expect(crossword.rows).toBe(6);
        expect(crossword.cols).toBe(4);
        expect(crossword.getClues().length).toBe(6);
    });

    it('should set and get a character at a cell for across word', () => {
        const words = [makeWord('cat', 'Feline', 0, 0, 'across')];
        const crossword = new Crossword(words);
        crossword.setCharAt(1, 0, 'x');
        expect(crossword.getCharAt(1, 0)).toBe('x');
        expect(words[0]?.text).toBe('cxt');
    });

    it('should set and get a character at a cell for down word', () => {
        const words = [makeWord('dog', 'Canine', 0, 0, 'down')];
        const crossword = new Crossword(words);
        crossword.setCharAt(0, 1, 'x');
        expect(crossword.getCharAt(0, 1)).toBe('x');
        expect(words[0]?.text).toBe('dxg');
    });

    it('should return undefined for getCharAt on empty cell', () => {
        const words = [makeWord('cat', 'Feline', 0, 0, 'across')];
        const crossword = new Crossword(words);
        expect(crossword.getCharAt(2, 2)).toBeUndefined();
    });

    it('should detect intersection for across and down words', () => {
        const words = [
            makeWord('cat', 'Feline', 0, 0, 'across'),
            makeWord('dog', 'Canine', 0, 1, 'down')
        ];
        const crossword = new Crossword(words);
        expect(crossword.intersectsWord(1, 0)).toBe(true); // across
        expect(crossword.intersectsWord(1, 1)).toBe(true); // down
        expect(crossword.intersectsWord(2, 2)).toBe(false);
        expect(crossword.intersectsWord(0, 1)).toBe(false);
    });

    it('should create blank and full copies', () => {
        const words = [makeWord('cat', 'Feline', 0, 0, 'across')];
        const crossword = new Crossword(words);
        const blank = crossword.createBlankCopy();
        const full = crossword.createFullCopy();
        expect(blank.getClues().length).toBe(1);
        expect(full.getClues().length).toBe(1);
        expect(blank.getCharAt(0, 0)).toBe('_');
        expect(full.getCharAt(0, 0)).toBe('c');
    });

    it('should throw an error when two words overlap incorrectly', () => {
        const words = [
            makeWord('cat', 'Feline', 0, 0, 'across'),
            makeWord('bat', 'Nocturnal animal', 0, 1, 'down')
        ];
        expect(() => new Crossword(words)).toThrow(CWInvalidWordOverlapError);
    });
});
