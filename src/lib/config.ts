import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import os from 'os';

export interface Config {
  sessionTimeout: number;
  trackingEnabled: boolean;
  projects: string[];
}

const CONFIG_DIR = path.join(os.homedir(), '.gittime');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DB_FILE = path.join(CONFIG_DIR, 'gittime.db');

const DEFAULT_CONFIG: Config = {
  sessionTimeout: 900, // 15 minutes
  trackingEnabled: true,
  projects: []
};

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function getDatabasePath(): string {
  return DB_FILE;
}

export function loadConfig(): Config {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(content) as Config;
    return {
      ...DEFAULT_CONFIG,
      ...config
    };
  } catch (error) {
    console.error('설정 파일을 읽을 수 없습니다:', error);
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Partial<Config>): void {
  ensureConfigDir();

  let currentConfig: Config = { ...DEFAULT_CONFIG };
  if (existsSync(CONFIG_FILE)) {
    try {
      const content = readFileSync(CONFIG_FILE, 'utf-8');
      currentConfig = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    } catch {
      // 파일 읽기 실패 시 기본값 사용
    }
  }

  const newConfig = { ...currentConfig, ...config };
  writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
}

export function addProjectToConfig(projectPath: string): void {
  const config = loadConfig();
  if (!config.projects.includes(projectPath)) {
    config.projects.push(projectPath);
    saveConfig(config);
  }
}

export function removeProjectFromConfig(projectPath: string): void {
  const config = loadConfig();
  config.projects = config.projects.filter(p => p !== projectPath);
  saveConfig(config);
}

export function getSessionTimeout(): number {
  const config = loadConfig();
  return config.sessionTimeout;
}

export function setSessionTimeout(seconds: number): void {
  saveConfig({ sessionTimeout: seconds });
}

export function isTrackingEnabled(): boolean {
  const config = loadConfig();
  return config.trackingEnabled;
}

export function setTrackingEnabled(enabled: boolean): void {
  saveConfig({ trackingEnabled: enabled });
}
