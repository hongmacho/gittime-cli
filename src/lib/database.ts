import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

export interface Session {
  id: number;
  repository_path: string;
  branch: string;
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  created_at: number;
}

export interface Project {
  id: number;
  repository_path: string;
  project_name: string;
  enabled: number;
  created_at: number;
}

let db: Database.Database | null = null;

export function initializeDatabase(dbPath: string): Database.Database {
  const dir = path.dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repository_path TEXT UNIQUE NOT NULL,
      project_name TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repository_path TEXT NOT NULL,
      branch TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      duration_seconds INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (repository_path) REFERENCES projects(repository_path)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      tag_name TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_repo_date ON sessions(repository_path, created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
  `);

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('데이터베이스가 초기화되지 않았습니다');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function addProject(
  repositoryPath: string,
  projectName: string
): Project {
  const database = getDatabase();
  const now = Math.floor(Date.now() / 1000);

  const stmt = database.prepare(`
    INSERT INTO projects (repository_path, project_name, enabled, created_at)
    VALUES (?, ?, 1, ?)
  `);

  stmt.run(repositoryPath, projectName, now);

  const result = database.prepare(
    'SELECT * FROM projects WHERE repository_path = ?'
  ).get(repositoryPath) as Project;

  return result;
}

export function removeProject(repositoryPath: string): void {
  const database = getDatabase();
  database.prepare('DELETE FROM projects WHERE repository_path = ?').run(
    repositoryPath
  );
}

export function getProject(repositoryPath: string): Project | undefined {
  const database = getDatabase();
  return database
    .prepare('SELECT * FROM projects WHERE repository_path = ?')
    .get(repositoryPath) as Project | undefined;
}

export function getAllProjects(): Project[] {
  const database = getDatabase();
  return database
    .prepare('SELECT * FROM projects WHERE enabled = 1 ORDER BY created_at DESC')
    .all() as Project[];
}

export function addSession(
  repositoryPath: string,
  branch: string,
  startTime: number
): Session {
  const database = getDatabase();
  const now = Math.floor(Date.now() / 1000);

  const stmt = database.prepare(`
    INSERT INTO sessions (repository_path, branch, start_time, duration_seconds, created_at)
    VALUES (?, ?, ?, 0, ?)
  `);

  stmt.run(repositoryPath, branch, startTime, now);

  const result = database
    .prepare('SELECT * FROM sessions WHERE repository_path = ? ORDER BY id DESC LIMIT 1')
    .get(repositoryPath) as Session;

  return result;
}

export function closeSession(
  repositoryPath: string,
  endTime: number
): Session | null {
  const database = getDatabase();

  const lastSession = database
    .prepare(
      `SELECT * FROM sessions WHERE repository_path = ? AND end_time IS NULL
       ORDER BY id DESC LIMIT 1`
    )
    .get(repositoryPath) as Session | undefined;

  if (!lastSession) {
    return null;
  }

  const durationSeconds = endTime - lastSession.start_time;

  const stmt = database.prepare(`
    UPDATE sessions
    SET end_time = ?, duration_seconds = ?
    WHERE id = ?
  `);

  stmt.run(endTime, durationSeconds, lastSession.id);

  return {
    ...lastSession,
    end_time: endTime,
    duration_seconds: durationSeconds
  };
}

export function getSessionsSinceTimestamp(sinceTimestamp: number): Session[] {
  const database = getDatabase();
  return database
    .prepare('SELECT * FROM sessions WHERE created_at >= ? ORDER BY created_at')
    .all(sinceTimestamp) as Session[];
}

export function getSessionsByRepository(
  repositoryPath: string,
  sinceTimestamp: number
): Session[] {
  const database = getDatabase();
  return database
    .prepare(
      `SELECT * FROM sessions
       WHERE repository_path = ? AND created_at >= ?
       ORDER BY created_at`
    )
    .all(repositoryPath, sinceTimestamp) as Session[];
}

export function getTotalDurationByRepository(
  repositoryPath: string,
  sinceTimestamp: number
): number {
  const database = getDatabase();
  const result = database
    .prepare(
      `SELECT SUM(duration_seconds) as total FROM sessions
       WHERE repository_path = ? AND created_at >= ?`
    )
    .get(repositoryPath, sinceTimestamp) as { total: number | null };

  return result.total || 0;
}

export function getTotalDurationAllProjects(sinceTimestamp: number): number {
  const database = getDatabase();
  const result = database
    .prepare(
      `SELECT SUM(duration_seconds) as total FROM sessions
       WHERE created_at >= ?`
    )
    .get(sinceTimestamp) as { total: number | null };

  return result.total || 0;
}

export function adjustSessionDuration(
  repositoryPath: string,
  adjustmentSeconds: number,
  date: Date = new Date()
): void {
  const database = getDatabase();
  const dayStart = Math.floor(date.getTime() / 1000 / 86400) * 86400;
  const dayEnd = dayStart + 86400;

  const stmt = database.prepare(`
    UPDATE sessions
    SET duration_seconds = duration_seconds + ?
    WHERE repository_path = ? AND created_at >= ? AND created_at < ?
    LIMIT 1
  `);

  stmt.run(adjustmentSeconds, repositoryPath, dayStart, dayEnd);
}
