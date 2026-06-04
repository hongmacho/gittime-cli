import chalk from 'chalk';
import { getDatabasePath } from '../lib/config';
import {
  initializeDatabase,
  getAllProjects,
  getSessionsByRepository,
  closeDatabase
} from '../lib/database';
import {
  formatDuration,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  formatDate,
  getRepositoryName
} from '../lib/utils';

export function reportCommand(format: string = 'markdown'): void {
  try {
    const db = initializeDatabase(getDatabasePath());
    const projects = getAllProjects();
    closeDatabase();

    if (projects.length === 0) {
      console.log(chalk.yellow('등록된 저장소가 없습니다'));
      process.exit(0);
    }

    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = getEndOfWeek(now);

    // Collect data
    const weekData: Record<string, number> = {};
    let totalWeekDuration = 0;

    projects.forEach(project => {
      const db = initializeDatabase(getDatabasePath());
      const sessions = getSessionsByRepository(project.repository_path, startOfWeek);
      closeDatabase();

      const weekSessions = sessions.filter(s => (s.end_time || 0) <= endOfWeek);
      const duration = weekSessions.reduce((sum, s) => sum + s.duration_seconds, 0);

      const repoName = getRepositoryName(project.repository_path);
      weekData[repoName] = duration;
      totalWeekDuration += duration;
    });

    if (format === 'csv') {
      reportCSV(weekData, totalWeekDuration);
    } else {
      reportMarkdown(weekData, totalWeekDuration, now);
    }

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 보고서 생성 실패:'), error);
    process.exit(1);
  }
}

function reportMarkdown(
  weekData: Record<string, number>,
  totalWeekDuration: number,
  date: Date
): void {
  const weekNum = Math.ceil(
    (date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7
  );

  console.log(`# 주간 시간 추적 보고서\n`);
  console.log(`**작성일**: ${date.toLocaleDateString('ko-KR')}`);
  console.log(`**주차**: ${date.getFullYear()}년 ${weekNum}주\n`);

  console.log('## 프로젝트별 시간\n');
  console.log('| 프로젝트 | 시간 |');
  console.log('|---------|------|');

  Object.entries(weekData).forEach(([project, duration]) => {
    console.log(`| ${project} | ${formatDuration(duration)} |`);
  });

  console.log(`\n**총 작업 시간**: ${formatDuration(totalWeekDuration)}\n`);

  console.log('## 요약\n');
  console.log(
    `이번 주에는 총 ${formatDuration(totalWeekDuration)}을(를) 작업했습니다.`
  );
}

function reportCSV(weekData: Record<string, number>, totalWeekDuration: number): void {
  console.log('프로젝트,시간(초),시간(포맷)');

  Object.entries(weekData).forEach(([project, duration]) => {
    console.log(`"${project}",${duration},"${formatDuration(duration)}"`);
  });

  console.log(`총계,${totalWeekDuration},"${formatDuration(totalWeekDuration)}"`);
}
