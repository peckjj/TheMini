import { describe, expect, it } from 'vitest';
import { Clue } from '../src/Classes/Clue';

describe('Clue', () => {
    it('should create a clue with the given text', () => {
        const clue = new Clue('Test clue');
        expect(clue.text).toBe('Test clue');
        expect(clue.direction).toBe('across');
        expect(clue.order).toBe(0);
    });
});