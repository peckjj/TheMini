
import { ICrosswordGame } from '../Interfaces/ICrosswordGame';
import { IDictionaryRepo } from '../Interfaces/IDictionaryRepo';
import { Crossword } from '../Classes/Crossword';
import { CrosswordGame } from '../Classes/CrosswordGame';
import { Word } from '../Classes/Word';
import { TDirection } from '../Types/TDirection';
import { Clue } from '../Classes/Clue';

function getFilledRows(words: Word[], maxRows: number, maxCols: number): Set<number> {
  const filled = new Set<number>();
  for (const word of words) {
    if (word.direction === 'across') {
      filled.add(word.row);
    } else {
      for (let i = 0; i < word.length; i++) {
        filled.add(word.row + i);
      }
    }
  }
  return filled;
}

export class CrosswordGeneration {
  static SampleCrossword(): ICrosswordGame {
    /*
          0 1 2 3 4 5
         ____________
       0| d o g   b
       1| W o m b a t
       2| a n t   t
       3|     a
       4| a k k e e m
       5| c h i c k e n
     */
    function makeWord(text: string, clueText: string, row: number, col: number, direction: TDirection): Word {
      const clue = new Clue(clueText);
      return new Word(-1, text, clue, row, col, direction);
    }

    const words = [
      makeWord('dog', 'Canine', 0, 0, 'across'),
      makeWord('Wombat', 'What is a wombat?', 1, 0, 'across'),
      makeWord('ant', 'Insect', 2, 0, 'across'),
      makeWord('oon', 'Feline', 0, 1, 'down'),
      makeWord('gmtak', 'Aquatic animal', 0, 2, 'down'),
      makeWord('bat', 'Nocturnal animal', 0, 4, 'down'),
      makeWord('akkeem', 'Letter T', 4, 0, 'across'),
      makeWord('chicken', 'What is a chicken?', 5, 0, 'across')
    ];
    const crossword = new Crossword(words);
    return new CrosswordGame(crossword);
  }

  static GenerateCrosswordGame(repo: IDictionaryRepo, maxRows: number = 5, maxCols: number = 5): ICrosswordGame {
    const words: Word[] = [];
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      attempts++;
      // Try to fill every row
      const filledRows = getFilledRows(words, maxRows, maxCols);
      if (filledRows.size >= maxRows) break;

      // Try to add a word in an unfilled row (across) or column (down)
      let placed = false;
      for (let row = 0; row < maxRows; row++) {
        if (!filledRows.has(row)) {
          // Try across
          for (let len = Math.min(maxCols, 7); len >= 3; len--) {
            if (row + 1 > maxRows) continue;
            for (let col = 0; col <= maxCols - len; col++) {
              const word = repo.getRandomWord(len);
              const candidate = new Word(word.id, word.text, word.clue, row, col, 'across');
              try {
                const test = new Crossword([...words, candidate]);
                words.push(candidate);
                placed = true;
                break;
              } catch { }
            }
            if (placed) break;
          }
        }
        if (placed) break;
      }
      if (!placed) {
        // Try down in columns that don't have any filled rows
        for (let col = 0; col < maxCols; col++) {
          let colFilled = false;
          for (const word of words) {
            if (word.direction === 'down' && word.col === col) {
              colFilled = true;
              break;
            }
          }
          if (!colFilled) {
            for (let len = Math.min(maxRows, 7); len >= 3; len--) {
              for (let row = 0; row <= maxRows - len; row++) {
                const word = repo.getRandomWord(len);
                const candidate = new Word(word.id, word.text, word.clue, row, col, 'down');
                try {
                  const test = new Crossword([...words, candidate]);
                  words.push(candidate);
                  placed = true;
                  break;
                } catch { }
              }
              if (placed) break;
            }
          }
          if (placed) break;
        }
      }
      if (!placed) break; // No more valid placements
    }

    // Final validation: ensure every row has at least one letter
    const finalRows = getFilledRows(words, maxRows, maxCols);
    if (finalRows.size < maxRows) {
      throw new Error('Unable to fill every row with at least one letter.');
    }
    const crossword = new Crossword(words);
    return new CrosswordGame(crossword);
  }
}
