import chalk from 'chalk';
import Table from 'cli-table3';
import {
  loadConfig,
  saveConfig,
  getSessionTimeout,
  setSessionTimeout,
  isTrackingEnabled,
  setTrackingEnabled,
  getConfigPath
} from '../lib/config';

export function configShowCommand(): void {
  try {
    const config = loadConfig();

    const table = new Table({
      head: [chalk.cyan('설정'), chalk.cyan('값')],
      style: { head: [], border: ['cyan'] }
    });

    table.push(
      ['sessionTimeout', `${config.sessionTimeout}초 (${Math.floor(config.sessionTimeout / 60)}분)`],
      ['trackingEnabled', config.trackingEnabled ? '활성화' : '비활성화'],
      ['configPath', getConfigPath()],
      ['projectCount', config.projects.length.toString()]
    );

    console.log(table.toString());
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 설정 조회 실패:'), error);
    process.exit(1);
  }
}

export function configSetCommand(key: string, value: string): void {
  try {
    if (key === 'sessionTimeout') {
      const seconds = parseInt(value, 10);
      if (isNaN(seconds) || seconds <= 0) {
        console.error(chalk.red('✗ 유효한 숫자를 입력하세요'));
        process.exit(1);
      }
      setSessionTimeout(seconds);
      console.log(
        chalk.green('✓') +
          ` 세션 타임아웃 설정 완료: ${seconds}초 (${Math.floor(seconds / 60)}분)`
      );
    } else if (key === 'trackingEnabled') {
      const enabled = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
      setTrackingEnabled(enabled);
      console.log(chalk.green('✓') + ` 추적 활성화 설정 완료: ${enabled ? '활성화' : '비활성화'}`);
    } else {
      console.error(chalk.red('✗ 알 수 없는 설정 키입니다'));
      console.log('사용 가능한 키: sessionTimeout, trackingEnabled');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 설정 저장 실패:'), error);
    process.exit(1);
  }
}

export function configResetCommand(): void {
  try {
    saveConfig({
      sessionTimeout: 900,
      trackingEnabled: true,
      projects: []
    });

    console.log(chalk.green('✓') + ' 설정이 기본값으로 초기화되었습니다');
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ 설정 초기화 실패:'), error);
    process.exit(1);
  }
}
