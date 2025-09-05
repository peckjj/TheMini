/* This script sets up the SQLite database by performing the following:

    1. Creating the database "themini.db" if it doesn't exist
    2. Creating the db schema (tables) if they don't exist
    3. Initializing the database with default data (if needed)

    It will effectively run SQL scripts that perform these tasks.

*/

// Will return connection to "themini.db". If the database
// doesn't exist, it will be created.
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

function executeScripts(scriptpath, db) {
    console.log(`Collecting scripts from ${scriptpath}...`);

    const fs = require('fs');
    const path = require('path');
    const schemaDir = path.resolve(__dirname, scriptpath);
    fs.readdir(schemaDir, (err, files) => {
        if (err) {
            console.error('Error reading schema directory:', err.message);
            return;
        }
        const sqlFiles = files.filter(file => file.endsWith('.sql'));
        // Sort files numerically by filename (e.g., 1.sql, 2.sql, 10.sql)
        sqlFiles.sort((a, b) => {
            const numA = parseInt(a.split('.')[0], 10);
            const numB = parseInt(b.split('.')[0], 10);
            return numA - numB;
        });

        console.log("Executing SQL scripts...");

        sqlFiles.forEach(file => {
            console.log(`Executing script: ${file}`);

            const filePath = path.join(schemaDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            db.exec(sql, (err) => {
                if (err) {
                    console.error(`Error executing ${file}:`, err.message);
                } else {
                    console.log(`Executed schema script: ${file}`);
                }
            });
        });
    });
}

const db = createDatabaseConnection();
executeScripts('./sql_scripts/schema', db);
executeScripts('./sql_scripts/data', db);
