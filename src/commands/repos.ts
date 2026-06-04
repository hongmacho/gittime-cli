import chalk from 'chalk';
import Table from 'cli-table3';
import { getDatabasePath } from '../lib/config';
import {
  initializeDatabase,
  addProject,
  removeProject,
  getAllProjects,
  getProject,
  closeDatabase
} from '../lib/database';
import { installHooks, uninstallHooks, hooksInstalled } from '../lib/hook-installer';
import { getRepositoryName } from '../lib/utils';
import { existsSync } from 'fs';

export function reposListCommand(): void {
  try {
    const db = initializeDatabase(getDatabasePath());
    const projects = getAllProjects();
    closeDatabase();

    if (projects.length === 0) {
      console.log(chalk.yellow('등록된 저장소가 없습니다'));
      console.log('등록하려면: gittime repos add <저장소-경로>');
      process.exit(0);
    }

    const table = new Table({
      head: [
        chalk.cyan('저장소'),
        chalk.cyan('경로'),
        chalk.cyan('Hook'),
        chalk.cyan('등록일')
      ],
      style: { head: [], border: ['cyan'] }
    });

    projects.forEach(project => {
      const repoName = getRepositoryName(project.repository_path);
      const hookStatus = hooksInstalled(project.repository_path)
        ? chalk.green('설치됨')
        : chalk.yellow('미설치');
      const date = new Date(project.created_at * 1000).toLocaleDateString('ko-KR');

      table.push([repoName, project.repository_path, hookStatus, date]);
    });

    console.log(table.toString());
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 저장소 목록 조회 실패:'), error);
    process.exit(1);
  }
}

export function reposAddCommand(repositoryPath: string): void {
  try {
    if (!existsSync(repositoryPath)) {
      console.error(chalk.red('✗ 경로가 존재하지 않습니다:'), repositoryPath);
      process.exit(1);
    }

    if (!existsSync(`${repositoryPath}/.git`)) {
      console.error(chalk.red('✗ Git 저장소가 아닙니다:'), repositoryPath);
      process.exit(1);
    }

    const db = initializeDatabase(getDatabasePath());

    // Check if already exists
    const existing = getProject(repositoryPath);
    if (existing) {
      console.log(chalk.yellow('이미 등록된 저장소입니다'));
      closeDatabase();
      process.exit(0);
    }

    // Add project to database
    const repoName = getRepositoryName(repositoryPath);
    const project = addProject(repositoryPath, repoName);
    closeDatabase();

    console.log(chalk.green('✓') + ' 저장소 등록 완료: ' + repoName);

    // Install hooks
    const hookResult = installHooks(repositoryPath);
    if (hookResult.success) {
      console.log(chalk.green('✓') + ' Git hook 설치 완료');
    } else {
      console.warn(chalk.yellow('⚠') + ' Git hook 설치 중 문제 발생:');
      hookResult.errors.forEach(err => console.warn('  ' + err));
    }

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 저장소 등록 실패:'), error);
    process.exit(1);
  }
}

export function reposRemoveCommand(repositoryPath: string): void {
  try {
    const db = initializeDatabase(getDatabasePath());
    const project = getProject(repositoryPath);

    if (!project) {
      console.error(chalk.red('✗ 등록되지 않은 저장소입니다'));
      closeDatabase();
      process.exit(1);
    }

    removeProject(repositoryPath);
    closeDatabase();

    // Uninstall hooks
    if (existsSync(`${repositoryPath}/.git`)) {
      uninstallHooks(repositoryPath);
    }

    console.log(chalk.green('✓') + ' 저장소 제거 완료');
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 저장소 제거 실패:'), error);
    process.exit(1);
  }
}
