import { describe, it, expect } from 'vitest';
import { Word } from '../src/Classes/Word';
import { Clue } from '../src/Classes/Clue';
import { CWIndexOutOfBoundsError } from '../src/Errors/CWIndexOutOfBoundsError';
import { CWInvalidCharLengthError } from '../src/Errors/CWInvalidCharLengthError';
import { CWInvalidCharTypeError } from '../src/Errors/CWInvalidCharTypeError';
import { CWEmptyWordError } from '../src/Errors/CWEmptyWordError';

const clue = new Clue('A fruit', 'across', 0);

describe('Word', () => {
    it('should create a Word with correct properties', () => {
        const word = new Word(-1, 'apple', clue, 0, 0, 'across');
        expect(word.text).toBe('apple');
        expect(word.row).toBe(0);
        expect(word.col).toBe(0);
        expect(word.direction).toBe('across');
        expect(word.length).toBe(5);
        expect(word.clue).toBe(clue);
    });

    it('should throw an empty word error if the word is empty or undefined', () => {
        expect(() => new Word(-1, '', clue, 0, 0, 'across')).toThrow(CWEmptyWordError);
    });

    it('should set a character at a valid index', () => {
        const word = new Word(-1, 'apple', clue, 0, 0, 'across');
        word.setCharAt(2, 'x');
        expect(word.text).toBe('apxle');
    });

    it('should throw CWIndexOutOfBoundsError for invalid index', () => {
        const word = new Word(-1,'apple', clue, 0, 0, 'across');
        expect(() => word.setCharAt(5, 'a')).toThrow(CWIndexOutOfBoundsError);
        expect(() => word.setCharAt(-1, 'a')).toThrow(CWIndexOutOfBoundsError);
    });

    it('should throw CWInvalidCharLengthError for multi-char input', () => {
        const word = new Word(-1, 'apple', clue, 0, 0, 'across');
        expect(() => word.setCharAt(0, 'ab')).toThrow(CWInvalidCharLengthError);
        expect(() => word.setCharAt(0, '')).toThrow(CWInvalidCharLengthError);
    });

    it('should throw CWInvalidCharTypeError for non-alpha input', () => {
        const word = new Word(-1, 'apple', clue, 0, 0, 'across');
        expect(() => word.setCharAt(0, '1')).toThrow(CWInvalidCharTypeError);
        expect(() => word.setCharAt(0, '@')).toThrow(CWInvalidCharTypeError);
    });

    it('should create a blank copy', () => {
        const word = new Word(-1, 'apple', clue, 0, 0, 'across');
        const blank = word.blankCopy();
        expect(blank.text).toBe('_____');
        expect(blank.clue).toBe(clue);
    });

    it('should create a full copy', () => {
        const word = new Word(-1, 'apple', clue, 0, 0, 'across');
        const copy = word.copy();
        expect(copy.text).toBe('apple');
        expect(copy.clue).toBe(clue);
    });

    it('should not alter the original when copy text is changed', () => {
        const word = new Word(-1, 'apple', clue, 0, 0, 'across');
        const copy = word.copy();
        copy.setCharAt(0, 'b');
        expect(word.text).toBe('apple');
        expect(copy.text).toBe('bpple');
    });

    it('should return text with correct length', () => {
        const word = new Word(-1, 'apple', clue, 0, 0, 'across');
        expect(word.text.length).toBe(5);
        expect(word.blankCopy().text).toBe('_____');
        expect(word.blankCopy().text.length).toBe(5);
    });
});
