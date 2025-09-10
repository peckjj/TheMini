import { DictionaryRepo } from "./DictionaryRepo.js";

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz_';
let MAX_BLANKS_RATIO = 0.50; // Maximum ratio of blanks to letters in a word
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

        // Check for duplicated words in rows and columns
        const foundWords = new Set<string>();
        for (let y = 0; y < gridY; y++) {
            const rowWords = grid[y]!.join('').split('_').filter(w => w.length > 1);
            for (let w of rowWords) {
                if (w.endsWith(' ')) continue;

                if (foundWords.has(w)) {
                    return false;
                }
                foundWords.add(w);
            }
        }

        for (let x = 0; x < gridX; x++) {
            const colWords = grid.map(row => row[x]).join('').split('_').filter(w => w.length > 1);
            for (let w of colWords) {
                if (w.endsWith(' ')) continue;

                if (foundWords.has(w)) {
                    return false;
                }
                foundWords.add(w);
            }
        }

        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                // check surrounding area of every cell. If it is marooned by underscores or edges, return false
                if ((/[a-zA-Z]/.test(grid[y]![x]!)) &&
                    (!(grid[y - 1]) || grid[y - 1]![x] === '_') &&
                    (!(grid[y + 1]) || grid[y + 1]![x] === '_') &&
                    (!(grid[y]![x - 1]) || grid[y]![x - 1] === '_') &&
                    (!(grid[y]![x + 1]) || grid[y]![x + 1] === '_')
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    static async generate(gridX = 5, gridY = 5, MAX_BLANKS_RATIO_PARAM = 0.50, timeLimitSeconds = 15, printProgress = false): Promise<string[][]> {
        const timeLimitMs = Math.floor(timeLimitSeconds * 1000);

        const startTime = Date.now();
        let curTime = startTime;

        MAX_BLANKS_RATIO = MAX_BLANKS_RATIO_PARAM;
        const repo = new DictionaryRepo('./sql/themini.db', false);

        let grid: string[][] = Array.from({ length: gridY }, () => Array(gridX).fill(' '));
        let charSetMap: Record<string, string> = {};

        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                if (timeLimitSeconds > 0 && Date.now() - curTime > timeLimitMs) {
                    console.log("Time limit exceeded, restarting...");
                    y = -1;
                    x = -1;
                    grid = Array.from({ length: gridY }, () => Array(gridX).fill(' '));
                    charSetMap = {};
                    curTime = Date.now();
                    break;
                }

                const curRowStr = grid[y]?.slice(0, x).join('').split("_").at(-1);
                const curColStr = grid.map(row => row[x]).slice(0, y).join('').split("_").at(-1);

                if (charSetMap[`${x},${y}`] === undefined) {
                    const rowCharset = await repo.getCharsetForPrefix(curRowStr || '', Math.min(MAX_WORD_LENGTH - curRowStr!.length, gridX - x));
                    const colCharset = await repo.getCharsetForPrefix(curColStr || '', Math.min(MAX_WORD_LENGTH - curColStr!.length, gridY - y));

                    // Get the intersection of the two sets
                    let chars = Array.from(rowCharset.intersection(colCharset)).join('');
                    if (curRowStr!.length == MAX_WORD_LENGTH || curColStr!.length == MAX_WORD_LENGTH) {
                        chars = "_";
                    }
                    charSetMap[`${x},${y}`] = chars;
                }
                let charSet = charSetMap[`${x},${y}`];


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
                    if (printProgress) {
                        console.clear();
                        for (let row of grid) {
                            console.log(row.join(' '));
                        }
                        console.log('---');
                    }
                    continue;
                }
            }
        }

        const totalTime = Date.now() - startTime;
        const hours = Math.floor(totalTime / 3600000);
        const minutes = Math.floor((totalTime % 3600000) / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        console.log(`Generated ${gridX}x${gridY} grid in ${hours} hrs ${minutes} mins ${seconds} secs`);

        return grid;
    }
}