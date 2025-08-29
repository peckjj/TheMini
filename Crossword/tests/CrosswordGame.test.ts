import { describe, it, expect, beforeEach } from 'vitest';
import { CrosswordGame } from '../src/Classes/CrosswordGame';
import { Crossword } from '../src/Classes/Crossword';
import { Word } from '../src/Classes/Word';
import { Clue } from '../src/Classes/Clue';

describe('CrosswordGame', () => {
    let game: CrosswordGame;
    let crossword: Crossword;

    beforeEach(() => {
        /*
        c a t
        o
        g
        */

        const clue1 = new Clue('Feline', 'across', 0);
        const clue2 = new Clue('Canine', 'down', 0);
        const word1 = new Word(-1, 'cat', clue1, 0, 0, 'across');
        const word2 = new Word(-1, 'cog', clue2, 0, 0, 'down');
        crossword = new Crossword([word1, word2]);
        game = new CrosswordGame(crossword);
    });

    it('should initialize with correct rows and cols', () => {
        expect(game.rows).toBe(crossword.rows);
        expect(game.cols).toBe(crossword.cols);
    });

    it('should set a character on the board', () => {
        game.setCharAt(0, 0, 'c');
        game.setCharAt(1, 0, 'a');
        game.setCharAt(2, 0, 't');
        expect(game.isSolved()).toBe(false); // dog is not filled
    });

    it('should detect solved state', () => {
        // Fill all correct letters
        game.setCharAt(0, 0, 'c');
        game.setCharAt(0, 1, 'a');
        game.setCharAt(0, 2, 't');
        game.setCharAt(0, 0, 'c');
        game.setCharAt(1, 0, 'o');
        game.setCharAt(2, 0, 'g');

        expect(game.isSolved()).toBe(true);
    });

    it('should return incorrect characters', () => {
        game.setCharAt(0, 0, 'x'); // wrong
        game.setCharAt(1, 0, 'b');
        game.setCharAt(2, 0, 't');
        const incorrect = game.getIncorrectCharacters();
        expect(incorrect).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ row: 0, col: 0 }),
                expect.objectContaining({ row: 0, col: 1 })
            ])
        );
    });

    it('should get the word given a set of coordinates and direction', () => {
        let word = game.getWord(0, 0, 'across');
        expect(word).toBeDefined();
        expect(word!.text).toEqual('___');
        expect(word!.direction).toBe('across');
        word = game.getWord(0, 0, 'down');
        expect(word).toBeDefined();
        expect(word!.text).toEqual('___');
        expect(word!.direction).toBe('down');
        word = game.getWord(0, 1, 'across');
        expect(word).toBeDefined();
        expect(word!.text).toEqual('___');
        expect(word!.direction).toBe('across');
        word = game.getWord(1, 0, 'down');
        expect(word).toBeDefined();
        expect(word!.text).toEqual('___');
        expect(word!.direction).toBe('down');
        word = game.getWord(1, 1, 'across');
        expect(word).toBeUndefined();
        word = game.getWord(1, 1, 'down');
        expect(word).toBeUndefined();
    });
});
