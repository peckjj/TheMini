
DROP TABLE IF EXISTS "charsets";
CREATE TABLE IF NOT EXISTS "charsets" (
	"id"	INTEGER UNIQUE,
	"prefix"	TEXT NOT NULL,
	"charset"	TEXT NOT NULL,
	"remaining-space"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	UNIQUE("prefix", "remaining-space")
);

DROP INDEX IF EXISTS "charsets-idx";
CREATE INDEX IF NOT EXISTS "charsets-idx" ON "charsets" (
	"prefix"	ASC,
	"remaining-space"	DESC
);