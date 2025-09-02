import { IDictionaryRepo } from "../Interfaces/IDictionaryRepo";
import { CWDataError } from "../Errors/CWDataError";
import { Database } from 'sqlite3';
import path from "path";

export class DictionaryRepo implements IDictionaryRepo {
    private dbPath: string;

    constructor(dbPath: string, isAbsolute = false) {
        this.dbPath = isAbsolute ? dbPath : path.resolve(__dirname, dbPath);
    }

    private checkWordRow(wordRow: unknown): wordRow is { id: number; word: string } {
        return (
            "id" in (wordRow as any) &&
            "word" in (wordRow as any) &&
            typeof (wordRow as any).id === "number" &&
            typeof (wordRow as any).word === "string"
        );
    }

    private getRandomInt(max: number, min = 0) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    private getDbConnection(): Promise<Database> {
        return new Promise((resolve, reject) => {
            const db = new Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database at', this.dbPath);
                    resolve(db);
                }
            });
        });
    }

    async getRandomWord(length?: number): Promise<{
        id: number;
        text: string;
    }> {
        return (await this.getRandomWords(1, length))[0];
    }

    async getRandomWords(count: number, length?: number): Promise<{
        id: number;
        text: string;
    }[]> {
        const db = await this.getDbConnection();
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
                        if (!this.checkWordRow(row)) {
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
    }
}