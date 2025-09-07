import type { IDictionaryRepo } from "../Interfaces/IDictionaryRepo.ts";
import { CWDataError } from "../../../Crossword/dist/Errors/CWDataError.js";
import { CWUnreachableError } from "../../../Crossword/dist/Errors/CWUnreachableError.js";
import pkg, { Database as DatabaseType } from 'sqlite3';
const { Database } = pkg;
import path from "path";

const __dirname = process.cwd();

export class DictionaryRepo implements IDictionaryRepo {
    private dbPath: string;
    private db: DatabaseType | undefined;

    constructor(dbPath: string, isAbsolute = false) {
        this.dbPath = isAbsolute ? dbPath : path.resolve(__dirname, dbPath);
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
}