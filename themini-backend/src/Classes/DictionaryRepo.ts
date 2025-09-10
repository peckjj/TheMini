import type { IDictionaryRepo } from "../Interfaces/IDictionaryRepo.ts";
import { CWDataError } from "../../../Crossword/dist/Errors/CWDataError.js";
import { CWUnreachableError } from "../../../Crossword/dist/Errors/CWUnreachableError.js";
import pkg, { Database as DatabaseType } from 'sqlite3';
import * as crypto from 'node:crypto';
const { Database } = pkg;
import path from "path";

const __dirname = process.cwd();

export class DictionaryRepo implements IDictionaryRepo {
    private dbPath: string;
    private db: DatabaseType | undefined;

    constructor(dbPath: string, isAbsolute = false) {
        this.dbPath = isAbsolute ? dbPath : path.resolve(__dirname, dbPath);
    }

    private async getWord(word: string): Promise<{ id: number; text: string } | null> {
        const db = await this.getDbConnection();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM "words" WHERE "word" = ?', [word], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.isWordRow(row) ? { id: row.id, text: row.word } : null);
                }
            });
        });
    }

    private isWordRow(wordRow: unknown): wordRow is { id: number; word: string } {
        return (
            wordRow != null &&
            "id" in (wordRow as any) &&
            "word" in (wordRow as any) &&
            typeof (wordRow as any).id === "number" &&
            typeof (wordRow as any).word === "string"
        );
    }

    private isCharsetRow(row: unknown): row is { prefix: string; charset: string } {
        return (
            row != null &&
            "prefix" in (row as any) &&
            "charset" in (row as any) &&
            typeof (row as any).prefix === "string" &&
            typeof (row as any).charset === "string"
        );
    }

    private getDbConnection(): Promise<DatabaseType> {
        if (this.db) {
            return Promise.resolve(this.db);
        }
        return new Promise((resolve, reject) => {
            const db = new Database(this.dbPath, (err) => {
                if (err) {
                    if (db) {
                        db.close();
                    }
                    reject(err);
                } else {
                    this.db = db;
                    resolve(db);
                }
            });
        });
    }

    async getRandomWord(length?: number): Promise<{
        id: number;
        text: string;
    }> {
        const ret = (await this.getRandomWords(1, length))[0];

        if (!ret) {
            throw new CWUnreachableError('Impossible. getRandomWords should have thrown error if no words found');
        }

        return ret;
    }

    async getRandomWords(count: number, length?: number): Promise<{
        id: number;
        text: string;
    }[]> {
        const db = await this.getDbConnection();
        try {
            let sql = 'SELECT * FROM "words"';
            if (length != null) {
                sql += ' WHERE LENGTH("word") = ?';
            }
            sql += ' ORDER BY RANDOM() LIMIT ?';
            const ret = new Promise<{ id: number; text: string }[]>((res, rej) => {
                db.all(sql, length == null ? [count] : [length, count], (err, rows) => {
                    if (err) {
                        rej(err);
                    } else {
                        const words: { id: number; text: string }[] = [];

                        if (rows.length !== count) {
                            rej(new CWDataError('No words found, or not enough for count=' + count));
                        }

                        for (const row of rows) {
                            if (!this.isWordRow(row)) {
                                rej(new CWDataError('Invalid word row: ' + JSON.stringify(row)));
                            } else {
                                words.push({ id: row.id, text: row.word });
                            }
                        }
                        res(words);
                    }
                });
            });

            return ret;
        } catch (err) {
            if (err instanceof CWDataError) {
                throw err;
            } else {
                throw new CWDataError('Database error: ' + (err as Error).message);
            }
        }
    }

    async getRandomWordWithPattern(pattern: string): Promise<{ id: number; text: string }> {
        const db = await this.getDbConnection();
        try {
            // replace all characters that are not a-z or A-Z with _
            const sqlPattern = pattern.toLowerCase().replace(/[^a-zA-Z]/g, '_');
            const sql = 'SELECT * FROM "words" WHERE "word" LIKE ? ORDER BY RANDOM() LIMIT 1';
            const row = await new Promise<{ id: number; text: string }>((res, rej) => {
                db.get(sql, [sqlPattern], (err, row) => {
                    if (err) {
                        rej(err);
                    } else {
                        if (!this.isWordRow(row)) {
                            rej(new CWDataError('Invalid word row: ' + JSON.stringify(row)));
                        } else {
                            res({
                                id: row.id,
                                text: row.word
                            });
                        }

                    }
                });
            });

            if (!row) {
                throw new CWDataError('No word found matching pattern: ' + pattern);
            }

            return row;
        } catch (err) {
            if (err instanceof CWDataError) {
                throw err;
            } else {
                throw new CWDataError('Database error: ' + (err as Error).message);
            }
        }
    }

    async wordExists(pattern: string, maxLength?: number): Promise<boolean> {
        const db = await this.getDbConnection();
        try {
            // replace all characters that are not a-z or A-Z with _
            const sqlPattern = pattern.toLowerCase().replace(/[^a-zA-Z%]/g, '_');
            let sql = 'SELECT EXISTS(SELECT 1 FROM "words" WHERE "word" LIKE ?)';

            if (maxLength != undefined) {
                sql += ' AND LENGTH("word") <= ?';
            }

            const exists = await new Promise<boolean>((res, rej) => {
                db.get(sql, maxLength == undefined ? [sqlPattern] : [sqlPattern, maxLength], (err, row) => {
                    if (err) {
                        rej(err);
                    } else {
                        res(Object.values(row as any || {}).some(val => val === 1));
                    }
                });
            });

            return exists;
        } catch (err) {
            if (err instanceof CWDataError) {
                throw err;
            } else {
                throw new CWDataError('Database error: ' + (err as Error).message);
            }
        }
    }

    async getCharsetForPrefix(prefix: string, remainingSize: number): Promise<Set<string>> {
        const db = await this.getDbConnection();
        try {
            const sql = 'SELECT charset FROM "charsets" WHERE prefix = ? AND "remaining-space" = ? LIMIT 1';
            const row = await new Promise<{ charset: string } | undefined>((res, rej) => {
                db.get(sql, [prefix, remainingSize], (err, row) => {
                    if (err) {
                        rej(err);
                    } else {
                        res(row as { charset: string } | undefined);
                    }
                });
            });
            const ret = new Set<string>();
            for (let c of (row?.charset || '')) {
                ret.add(c);
            }
            return ret;
        } catch (err) {
            if (err instanceof CWDataError) {
                throw err;
            } else {
                throw new CWDataError('Database error: ' + (err as Error).message);
            }
        }
    }

    async getCharsetPrefixMap(): Promise<Record<string, Set<string>>> {
        const db = await this.getDbConnection();
        try {
            const sql = 'SELECT prefix, charset FROM "charsets"';
            const ret = await new Promise<Record<string, Set<string>>>((res, rej) => {
                db.all(sql, [], (err, rows) => {
                    if (err) {
                        rej(err);
                    } else {
                        const map: Record<string, Set<string>> = {};
                        for (const row of rows) {
                            if (!this.isCharsetRow(row)) {
                                rej(new CWDataError('Invalid charset row: ' + JSON.stringify(row)));
                                return;
                            }
                            map[row.prefix] = new Set<string>(row.charset.split(''));
                        }
                        res(map);
                    }
                });
            });

            return ret;
        } catch (err) {
            if (err instanceof CWDataError) {
                throw err;
            } else {
                throw new CWDataError('Database error: ' + (err as Error).message);
            }
        }
    }

    async createAndInsertCrossword(grid: string[][], crosswordName: string): Promise<number> {
        const db = await this.getDbConnection();
        const self = this;
        try {
            return await new Promise<number>((res, rej) => {
                const gridToString = grid.map(row => row.join('')).join('');
                const gridHash = crypto.createHash('sha256').update(gridToString).digest('hex');

                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    db.run('INSERT INTO crosswords (title, sha256) VALUES (?, ?)', [crosswordName, gridHash], async function (err) {
                        if (err) {
                            db.run('ROLLBACK');
                            rej(err);
                            return;
                        }
                        const crosswordId = this.lastID;
                        const stmt = db.prepare('INSERT INTO crossword_word (crossword_id, word_id, direction_id, row, col) VALUES (?, ?, (SELECT id FROM direction WHERE name = ?), ?, ?)');
                        let curRow = 0;
                        for (let row of grid) {
                            let col = 0;
                            for (let word of row.join('').split('_')) {
                                if (!word) continue;
                                else if (word.length == 1) {
                                    col += 2;
                                    continue;
                                }
                                const word_id = (await self.getWord(word))?.id;
                                if (word_id) {
                                    stmt.run(crosswordId, word_id, 'across', curRow, col);
                                    col += word.length + 1;
                                } else {
                                    console.warn(`Word not found in database: ${word}`);
                                    db.run('ROLLBACK');
                                    rej(new CWDataError(`Word not found in database: ${word}`));
                                    return;
                                }
                            }
                            curRow++;
                        }

                        for (let col = 0; col < grid[0]!.length; col++) {
                            let row = 0;
                            for (let word of grid.map(row => row[col]).join('').split('_')) {
                                if (!word) continue;
                                else if (word.length == 1) {
                                    row += 2;
                                    continue;
                                }
                                const word_id = (await self.getWord(word))?.id;
                                if (word_id) {
                                    stmt.run(crosswordId, word_id, 'down', row, col);
                                    row += word.length + 1;
                                } else {
                                    console.warn(`Word not found in database: ${word}`);
                                    db.run('ROLLBACK');
                                    rej(new CWDataError(`Word not found in database: ${word}`));
                                    return;
                                }
                            }
                        }

                        stmt.finalize();
                        db.run('COMMIT');
                        res(crosswordId);
                    });
                });
            });
        } catch (err) {
            if (err instanceof CWDataError) {
                throw err;
            } else {
                throw new CWDataError('Database error: ' + (err as Error).message);
            }
        }
    }
}
