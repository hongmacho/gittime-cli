import chalk from 'chalk';
import { getDatabasePath } from '../lib/config';
import {
  initializeDatabase,
  getProject,
  getSessionsByRepository,
  closeDatabase
} from '../lib/database';
import { formatDuration, getStartOfDay, getEndOfDay } from '../lib/utils';

export function adjustCommand(
  repositoryPath: string,
  operation: 'add' | 'subtract',
  minutes: number,
  dateStr?: string
): void {
  try {
    if (minutes < 0) {
      console.error(chalk.red('✗ 분 단위는 양수여야 합니다'));
      process.exit(1);
    }

    const db = initializeDatabase(getDatabasePath());
    const project = getProject(repositoryPath);
    closeDatabase();

    if (!project) {
      console.error(chalk.red('✗ 등록되지 않은 저장소입니다'));
      process.exit(1);
    }

    // Parse date
    let targetDate = new Date();
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) {
        console.error(chalk.red('✗ 잘못된 날짜 형식입니다. YYYY-MM-DD를 사용하세요'));
        process.exit(1);
      }
      targetDate = parsed;
    }

    const adjustmentSeconds = minutes * 60;
    const finalAdjustment = operation === 'add' ? adjustmentSeconds : -adjustmentSeconds;

    // Get sessions for the target date
    const startOfDay = getStartOfDay(targetDate);
    const endOfDay = getEndOfDay(targetDate);

    const db2 = initializeDatabase(getDatabasePath());
    const sessions = getSessionsByRepository(repositoryPath, startOfDay);
    closeDatabase();

    const targetSessions = sessions.filter(s => s.created_at <= endOfDay);

    if (targetSessions.length === 0) {
      console.error(
        chalk.red('✗ 해당 날짜에 기록된 세션이 없습니다'),
        targetDate.toLocaleDateString('ko-KR')
      );
      process.exit(1);
    }

    // Apply adjustment to the first session of the day
    const db3 = initializeDatabase(getDatabasePath());
    const firstSession = targetSessions[0];
    const newDuration = Math.max(0, firstSession.duration_seconds + finalAdjustment);

    const stmt = db3.prepare(`
      UPDATE sessions
      SET duration_seconds = ?
      WHERE id = ?
    `);

    stmt.run(newDuration, firstSession.id);
    closeDatabase();

    const oldDuration = formatDuration(firstSession.duration_seconds);
    const newDurationStr = formatDuration(newDuration);

    console.log(chalk.green('✓') + ' 시간 조정 완료');
    console.log(`  날짜: ${targetDate.toLocaleDateString('ko-KR')}`);
    console.log(`  이전: ${oldDuration}`);
    console.log(`  변경: ${operation === 'add' ? '+' : '-'}${minutes}분`);
    console.log(`  현재: ${newDurationStr}`);

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 시간 조정 실패:'), error);
    process.exit(1);
  }
}
