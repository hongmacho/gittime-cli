#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { reposListCommand, reposAddCommand, reposRemoveCommand } from './commands/repos';
import { statusCommand } from './commands/status';
import { adjustCommand } from './commands/adjust';
import { reportCommand } from './commands/report';
import { configShowCommand, configSetCommand, configResetCommand } from './commands/config';
import { hookSessionChangeCommand, hookSessionUpdateCommand } from './commands/hook-internal';

const program = new Command();

program
  .name('gittime')
  .description(chalk.cyan('Git 활동 기반 자동 시간 추적 CLI — 클릭 0회'))
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('gittime-cli 초기화')
  .action(() => {
    initCommand();
  });

// Repos command group
const reposCmd = program.command('repos').description('저장소 관리');

reposCmd
  .command('list')
  .alias('ls')
  .description('등록된 저장소 목록 조회')
  .action(() => {
    reposListCommand();
  });

reposCmd
  .command('add <path>')
  .description('저장소 등록')
  .action((path: string) => {
    reposAddCommand(path);
  });

reposCmd
  .command('remove <path>')
  .alias('rm')
  .description('저장소 제거')
  .action((path: string) => {
    reposRemoveCommand(path);
  });

// Status command
program
  .command('status')
  .description('작업 시간 상태 조회')
  .option('-r, --range <range>', '기간 선택 (today|week|month)', 'today')
  .action((options) => {
    statusCommand(options.range);
  });

// Adjust command
program
  .command('adjust <path> <operation> <minutes>')
  .description('시간 수동 조정')
  .option('-d, --date <date>', '대상 날짜 (YYYY-MM-DD)')
  .action((path: string, operation: string, minutes: string, options) => {
    if (operation !== 'add' && operation !== 'subtract') {
      console.error(chalk.red('✗ operation은 add 또는 subtract여야 합니다'));
      process.exit(1);
    }

    const mins = parseInt(minutes, 10);
    if (isNaN(mins)) {
      console.error(chalk.red('✗ minutes는 숫자여야 합니다'));
      process.exit(1);
    }

    adjustCommand(path, operation as 'add' | 'subtract', mins, options.date);
  });

// Report command
program
  .command('report')
  .description('주간 보고서 생성')
  .option('-f, --format <format>', '형식 선택 (markdown|csv)', 'markdown')
  .action((options) => {
    reportCommand(options.format);
  });

// Config command group
const configCmd = program.command('config').description('설정 관리');

configCmd
  .command('show')
  .description('설정 조회')
  .action(() => {
    configShowCommand();
  });

configCmd
  .command('set <key> <value>')
  .description('설정 변경')
  .action((key: string, value: string) => {
    configSetCommand(key, value);
  });

configCmd
  .command('reset')
  .description('설정 초기화')
  .action(() => {
    configResetCommand();
  });

// Internal hook commands (not shown in help)
program
  .command('__hook-session-change <path> <branch> <timestamp>')
  .description('[내부] 세션 변경')
  .action((path: string, branch: string) => {
    hookSessionChangeCommand(path, branch);
  });

program
  .command('__hook-session-update <path> <branch> <timestamp>')
  .description('[내부] 세션 업데이트')
  .action((path: string, branch: string) => {
    hookSessionUpdateCommand(path, branch);
  });

// Help and default action
program.on('--help', () => {
  console.log();
  console.log(chalk.cyan('사용 예제:'));
  console.log('  gittime init                             # 초기화');
  console.log('  gittime repos add /path/to/repo          # 저장소 등록');
  console.log('  gittime repos list                       # 저장소 목록');
  console.log('  gittime status                           # 오늘 작업 시간');
  console.log('  gittime status --range week              # 이번 주 작업 시간');
  console.log('  gittime adjust /path add 30              # 30분 추가');
  console.log('  gittime report                           # 주간 보고서');
  console.log('  gittime config show                      # 설정 조회');
  console.log();
});

program.parse(process.argv);

if (process.argv.length < 3) {
  program.outputHelp();
  process.exit(0);
}
