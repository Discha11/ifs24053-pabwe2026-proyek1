const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(process.env.DB_PATH || path.join(__dirname, '..', 'sada.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS donors (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    blood_type   TEXT NOT NULL CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    city         TEXT NOT NULL,
    phone        TEXT NOT NULL UNIQUE,
    last_donated TEXT,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE TABLE IF NOT EXISTS requests (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    blood_type    TEXT NOT NULL CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    hospital      TEXT NOT NULL,
    city          TEXT NOT NULL,
    units         INTEGER NOT NULL CHECK (units BETWEEN 1 AND 20),
    urgency       TEXT NOT NULL CHECK (urgency IN ('darurat','segera','terjadwal')),
    contact_phone TEXT NOT NULL,
    needed_date   TEXT,
    status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    email        TEXT NOT NULL UNIQUE,
    password     TEXT NOT NULL,
    name         TEXT NOT NULL,
    blood_type   TEXT NOT NULL CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    city         TEXT NOT NULL,
    phone        TEXT NOT NULL UNIQUE,
    last_donated TEXT,
    donor_id     INTEGER,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE SET NULL
  );
`);

module.exports = db;
