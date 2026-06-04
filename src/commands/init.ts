import chalk from 'chalk';
import { ensureConfigDir, getDatabasePath, loadConfig } from '../lib/config';
import { initializeDatabase, closeDatabase } from '../lib/database';

export function initCommand(): void {
  try {
    console.log(chalk.blue('gittime-cli 초기화 중...'));

    // Initialize config directory
    ensureConfigDir();
    console.log(chalk.green('✓') + ' 설정 디렉토리 생성 완료');

    // Initialize database
    const dbPath = getDatabasePath();
    const db = initializeDatabase(dbPath);
    closeDatabase();
    console.log(chalk.green('✓') + ' 데이터베이스 초기화 완료');

    // Load and display config
    const config = loadConfig();
    console.log(chalk.green('✓') + ' 설정 파일 생성 완료');

    console.log();
    console.log(chalk.cyan('설정 정보:'));
    console.log(`  경로: ${getDatabasePath()}`);
    console.log(`  세션 타임아웃: ${config.sessionTimeout}초 (15분)`);
    console.log(`  추적 활성화: ${config.trackingEnabled ? '예' : '아니오'}`);

    console.log();
    console.log(chalk.cyan('다음 단계:'));
    console.log('  1. 저장소 등록: gittime repos add <저장소-경로>');
    console.log('  2. 상태 확인: gittime status');
    console.log('  3. 도움말: gittime --help');

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 초기화 실패:'), error);
    process.exit(1);
  }
}
