function createDatabaseConnection() {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.resolve(__dirname, './themini.db');
    // This will create the file if it doesn't exist
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to SQLite database at', dbPath);
        }
    });
    return db;
}

function getAllWordsWithWildcard(db, prefix) {
    const sql = `SELECT word FROM words WHERE word LIKE ?`;
    const wildcard = prefix + '%';
    return new Promise((resolve, reject) => {
        db.all(sql, [wildcard], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => row.word));
            }
        });
    });
}

// Given a list of words and a prefix, return all characters that can follow the prefix
function generateCharSet(words, prefix) {
    if (words.length === 0 && prefix.length > 0) {
        return '';
    }

    const charSet = new Set();
    for (const word of words) {
        const nextChar = word[prefix.length];
        if (nextChar) {
            charSet.add(nextChar);
        }
    }

    let ret = Array.from(charSet).sort().join('');
    if (words.includes(prefix) || prefix.length === 0) {
        ret += '_';
    }
    return ret;
}

function insertCharSet(db, prefix, charSet, remainingSpace) {
    const sql = `INSERT INTO charsets (prefix, charset, "remaining-space") VALUES (?, ?, ?)
                 ON CONFLICT(prefix, "remaining-space") DO UPDATE SET charset = excluded.charset, "remaining-space" = excluded."remaining-space"`;
    return new Promise((resolve, reject) => {
        db.run(sql, [prefix, charSet, remainingSpace], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const charset = 'abcdefghijklmnopqrstuvwxyz';
const db = createDatabaseConnection();
const MAX_WORD_LENGTH = 5;

async function iterateCombinations(charset, maxLen, callback) {
    callback('');

    for (let len = 1; len <= maxLen; len++) {
        // Initialize an array to represent the current "number" in base-N
        let indices = Array(len).fill(0);
        while (true) {
            // Build the current combination
            let combination = indices.map(i => charset[i]).join('');
            await callback(combination);

            // Increment the "number"
            let pos = len - 1;
            while (pos >= 0) {
                indices[pos]++;
                if (indices[pos] < charset.length) break;
                indices[pos] = 0;
                pos--;
            }
            if (pos < 0) break; // All combinations for this length are done
        }
    }
}

iterateCombinations(charset, MAX_WORD_LENGTH - 1, async (combination) => {
    const words = await getAllWordsWithWildcard(db, combination);
    let remainingSpace = MAX_WORD_LENGTH - combination.length;

    for (let i = remainingSpace; i >= 0; i--) {
        let filteredWords = words.filter(word => word.length <= combination.length + i);

        const charSet = generateCharSet(filteredWords, combination);
        if (charSet.length === 0) {
            // console.log(`No words found for prefix "${combination}", skipping.`);
            return;
        }
        await insertCharSet(db, combination, charSet, i);
        console.log(`Inserted/Updated charset for prefix "${combination}" (remaining space = ${i}): ${charSet}`);
    }
});
