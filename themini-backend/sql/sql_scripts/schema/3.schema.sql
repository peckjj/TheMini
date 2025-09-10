
DROP TABLE IF EXISTS "crosswords";
CREATE TABLE IF NOT EXISTS "crosswords" (
	"id"	INTEGER UNIQUE,
	"title"	TEXT,
	"sha256"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);

DROP TABLE IF EXISTS "direction";
CREATE TABLE IF NOT EXISTS "direction" (
	"id"	INTEGER UNIQUE,
	"name"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "direction" ("name") VALUES ('across'), ('down');

DROP TABLE IF EXISTS "crossword_word";
CREATE TABLE IF NOT EXISTS "crossword_word" (
	"crossword_id"	INTEGER NOT NULL,
	"word_id"	INTEGER NOT NULL,
	"direction_id"	INTEGER NOT NULL,
	"row"	INTEGER NOT NULL,
	"col"	INTEGER NOT NULL,
	PRIMARY KEY("crossword_id", "word_id"),
	FOREIGN KEY("crossword_id") REFERENCES "crosswords"("id") ON DELETE CASCADE,
	FOREIGN KEY("word_id") REFERENCES "words"("id") ON DELETE CASCADE,
	FOREIGN KEY("direction_id") REFERENCES "direction"("id") ON DELETE CASCADE,
	UNIQUE("crossword_id", "word_id")
);

DROP VIEW IF EXISTS "crossword-word-sets";
CREATE VIEW "crossword-word-sets" AS SELECT cw.id, cw.title, w.word, d.name as 'direction', cww.row, cww.col FROM crossword_word cww
	JOIN crosswords cw ON cww.crossword_id = cw.id
	JOIN words w ON cww.word_id = w.id
	JOIN direction d ON cww.direction_id = d.id
ORDER BY cw.id ASC, d.name ASC, cww.row ASC, cww.col ASC