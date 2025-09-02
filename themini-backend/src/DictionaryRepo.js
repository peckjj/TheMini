"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryRepo = void 0;
const sqlite3_1 = require("sqlite3");
const path_1 = __importDefault(require("path"));
class DictionaryRepo {
    dbPath;
    constructor(dbPath, isAbsolute = false) {
        this.dbPath = isAbsolute ? dbPath : path_1.default.resolve(__dirname, dbPath);
    }
    checkWordRow(wordRow) {
        return ("id" in wordRow &&
            "word" in wordRow &&
            typeof wordRow.id === "number" &&
            typeof wordRow.word === "string");
    }
    getRandomInt(max, min = 0) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    getDbConnection() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3_1.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                }
                else {
                    console.log('Connected to SQLite database at', this.dbPath);
                    resolve(db);
                }
            });
        });
    }
    async getRandomWord(length) {
        return (await this.getRandomWords(1, length))[0];
    }
    async getRandomWords(count, length) {
        const db = await this.getDbConnection();
        let sql = 'SELECT * FROM "words"';
        if (length != null) {
            sql += ' WHERE LENGTH("word") = ?';
        }
        sql += ' ORDER BY RANDOM() LIMIT ?';
        const ret = new Promise((res, rej) => {
            db.all(sql, length == null ? [count] : [length, count], (err, rows) => {
                if (err) {
                    rej(err);
                }
                else {
                    const words = [];
                    if (rows.length !== count) {
                        rej(new Error('No words found, or not enough for count=' + count));
                    }
                    for (const row of rows) {
                        if (!this.checkWordRow(row)) {
                            rej(new Error('Invalid word row: ' + JSON.stringify(row)));
                        }
                        else {
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
exports.DictionaryRepo = DictionaryRepo;
//# sourceMappingURL=DictionaryRepo.js.map