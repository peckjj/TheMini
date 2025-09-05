import type { ICrossword } from "../../../Crossword/dist/Interfaces/ICrossword.js";
import { DictionaryRepo } from "./DictionaryRepo.js";

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz_';
const MAX_BLANKS_RATIO = 0.50; // Maximum ratio of blanks to letters in a word
const MAX_WORD_LENGTH = 5;

export class CrosswordGen {

    // Generates a completely filled crossword using backtracking algorithm.
    // Will fill the grid with random letters, checking if words exist in the dictionary
    // for each row and column as they are filled.
    private static async validGrid(grid: string[][], repo: DictionaryRepo): Promise<boolean> {
        const gridX = grid[0]!.length;
        const gridY = grid.length;

        // If number of underscores exceeds the maximum allowed ratio, return false
        let totalSpaces = gridX * gridY;
        let blankCount = 0;
        for (let row of grid) {
            for (let cell of row) {
                if (cell === '_') {
                    blankCount++;
                }
            }
        }

        if (blankCount / totalSpaces > MAX_BLANKS_RATIO) {
            return false;
        }

        // check every row to see if it's a valid word
        for (let y = 0; y < gridY; y++) {
            const rowPattern = grid[y]?.join('').split('_');
            if (rowPattern) {
                for (const part of rowPattern) {
                    // If the part is only underscores or empty, skip it
                    if (!/[a-z]/.test(part)) {
                        continue;
                    }

                    // if the part is only a single letter, it is wrapped in underscores and/or grid edges
                    // This should be valid, so skip it
                    if (part.length === 1) {
                        continue;
                    }

                    const exists = await repo.wordExists(part.replace(/\s+$/, '%'), part.length);
                    if (!exists) {
                        // console.log(`Row ${y} with pattern ${part} does not exist`);
                        return false;
                    }
                }
            } else {
                throw new Error("Row is undefined");
            }
        }

        // Check every column to see if it's a valid word
        for (let x = 0; x < gridX; x++) {
            let colPattern = grid.map(row => row[x]).join('').split('_');
            if (colPattern) {
                for (let part of colPattern) {
                    if (!/[a-z]/.test(part)) {
                        continue;
                    }

                    if (part.length === 1) {
                        continue;
                    }

                    const exists = await repo.wordExists(part.replace(/\s+$/, '%'), part.length);
                    if (!exists) {
                        // console.log(`Column ${x} with pattern ${part} does not exist`);
                        return false;
                    }
                }
            } else {
                throw new Error("Column is undefined");
            }
        }

        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                // check surrounding area of every cell. If it is marooned by underscores or edges, return false
                if (
                    (!(grid[y-1]) || grid[y-1]![x] === '_') &&
                    (!(grid[y+1]) || grid[y+1]![x] === '_') &&
                    (!(grid[y]![x-1]) || grid[y]![x-1] === '_') &&
                    (!(grid[y]![x+1]) || grid[y]![x+1] === '_')
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    static async generate(gridX = 5, gridY = 5): Promise<string[][]> {
        const repo = new DictionaryRepo('./sql/themini.db', false);

        const grid: string[][] = Array.from({ length: gridY }, () => Array(gridX).fill(' '));
        const charSetMap: Record<string, string> = {};


        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                if (charSetMap[`${x},${y}`] === undefined) {
                    charSetMap[`${x},${y}`] = ALPHABET + '';
                }
                let charSet = charSetMap[`${x},${y}`];
                const curRowStr = grid[y]?.slice(0, x + 1).join('').split("_").at(-1);
                const curColStr = grid.map(row => row[x]).slice(0, y + 1).join('').split("_").at(-1);

                if (curRowStr!.length == MAX_WORD_LENGTH + 1 || curColStr!.length == MAX_WORD_LENGTH + 1) {
                    charSet = "_";
                }

                if (!charSet || charSet.length === 0) {
                    delete charSetMap[`${x},${y}`];
                    grid[y]![x] = ' ';
                    x -= 2;
                    if (x < -1) {
                        if (y === 0) {
                            throw new Error("No solution found");
                        }
                        y--;
                        x = gridX - 2;
                    }
                    continue;
                }
                const randomChar = charSet!.charAt(Math.floor(Math.random() * charSet!.length));
                grid[y]![x] = randomChar;
                charSet = charSet!.replace(randomChar, ''); // Remove this char from possible choices
                charSetMap[`${x},${y}`] = charSet;
                if (!(await this.validGrid(grid, repo))) {
                    x--; // Retry this position
                } else {
                    for (let row of grid) {
                        console.log(row.join(''));
                    }
                    console.log('---');
                    continue;
                }
            }
        }

        return grid;
    }
}