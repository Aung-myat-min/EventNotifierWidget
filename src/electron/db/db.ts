import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";
import { app } from "electron";

const dbPath = path.join(app.getPath("userData"), "events.db");

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDB() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT 0
    )
  `);

  console.log("Database initialized.");
}

// Function to get all events
export async function getEvents() {
  return await db.all("SELECT * FROM events ORDER BY date ASC");
}

// Function to add a new event
export async function addEvent(title: string, date: string) {
  return await db.run(
    "INSERT INTO events (title, date, completed) VALUES (?, ?, 0)",
    [title, date]
  );
}

// Function to mark an event as completed
export async function completeEvent(id: number) {
  return await db.run("UPDATE events SET completed = 1 WHERE id = ?", [id]);
}
