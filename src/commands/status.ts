import chalk from 'chalk';
import Table from 'cli-table3';
import { getDatabasePath } from '../lib/config';
import {
  initializeDatabase,
  getAllProjects,
  getSessionsByRepository,
  getTotalDurationAllProjects,
  closeDatabase
} from '../lib/database';
import {
  formatDuration,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getDayName,
  getRepositoryName
} from '../lib/utils';

export function statusCommand(range: string = 'today'): void {
  try {
    const db = initializeDatabase(getDatabasePath());
    const projects = getAllProjects();
    closeDatabase();

    if (projects.length === 0) {
      console.log(chalk.yellow('등록된 저장소가 없습니다'));
      process.exit(0);
    }

    let startTime: number;
    let endTime: number;
    let title: string;

    const now = new Date();

    switch (range) {
      case 'today':
        startTime = getStartOfDay(now);
        endTime = getEndOfDay(now);
        title = `오늘의 작업 시간 (${now.toLocaleDateString('ko-KR')})`;
        break;
      case 'week':
        startTime = getStartOfWeek(now);
        endTime = getEndOfWeek(now);
        const weekNum = Math.ceil(
          (now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7
        );
        title = `이번 주의 작업 시간 (${now.getFullYear()}년 ${weekNum}주)`;
        break;
      case 'month':
        startTime = getStartOfMonth(now);
        endTime = getEndOfMonth(now);
        title = `이번 달의 작업 시간 (${now.getFullYear()}년 ${now.getMonth() + 1}월)`;
        break;
      default:
        console.error(chalk.red('✗ 잘못된 범위입니다. today, week, month 중 선택하세요'));
        process.exit(1);
    }

    console.log(chalk.cyan.bold(title));
    console.log();

    const table = new Table({
      head: [chalk.cyan('저장소'), chalk.cyan('시간'), chalk.cyan('세션 수')],
      style: { head: [], border: ['cyan'] }
    });

    let totalDuration = 0;

    projects.forEach(project => {
      const db = initializeDatabase(getDatabasePath());
      const sessions = getSessionsByRepository(project.repository_path, startTime);
      closeDatabase();

      // Filter sessions by end time
      const filteredSessions = sessions.filter(
        s => (s.end_time || Date.now() / 1000) <= endTime
      );

      const duration = filteredSessions.reduce((sum, s) => sum + s.duration_seconds, 0);
      totalDuration += duration;

      const repoName = getRepositoryName(project.repository_path);
      table.push([
        repoName,
        chalk.yellow(formatDuration(duration)),
        chalk.white(filteredSessions.length.toString())
      ]);
    });

    console.log(table.toString());
    console.log();
    console.log(chalk.cyan('총 작업 시간: ') + chalk.yellow.bold(formatDuration(totalDuration)));

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 상태 조회 실패:'), error);
    process.exit(1);
  }
}
