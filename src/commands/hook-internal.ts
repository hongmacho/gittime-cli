import { getDatabasePath, getSessionTimeout } from '../lib/config';
import {
  initializeDatabase,
  addSession,
  closeSession,
  getProject,
  closeDatabase
} from '../lib/database';

export function hookSessionChangeCommand(repositoryPath: string, branch: string): void {
  try {
    const db = initializeDatabase(getDatabasePath());
    const project = getProject(repositoryPath);

    if (!project) {
      closeDatabase();
      process.exit(0);
    }

    // Close previous session
    const now = Math.floor(Date.now() / 1000);
    closeSession(repositoryPath, now);

    // Start new session
    addSession(repositoryPath, branch, now);

    closeDatabase();
    process.exit(0);
  } catch (error) {
    // Silently fail for hook
    process.exit(0);
  }
}

export function hookSessionUpdateCommand(repositoryPath: string, branch: string): void {
  try {
    const db = initializeDatabase(getDatabasePath());
    const project = getProject(repositoryPath);

    if (!project) {
      closeDatabase();
      process.exit(0);
    }

    // Keep session active by checking timeout
    const sessionTimeout = getSessionTimeout();
    const now = Math.floor(Date.now() / 1000);

    // Just record activity - session continues
    // This ensures continuous activity during commits is tracked

    closeDatabase();
    process.exit(0);
  } catch (error) {
    // Silently fail for hook
    process.exit(0);
  }
}
