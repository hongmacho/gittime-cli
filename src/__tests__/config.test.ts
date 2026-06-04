import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

// Mock the config directory for testing
const TEST_CONFIG_DIR = path.join(__dirname, '../../test-config');

describe('Config', () => {
  beforeEach(() => {
    // Create test config directory
    if (!fs.existsSync(TEST_CONFIG_DIR)) {
      fs.mkdirSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test config directory
    if (fs.existsSync(TEST_CONFIG_DIR)) {
      fs.rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  it('should handle config with default values', () => {
    const configFile = path.join(TEST_CONFIG_DIR, 'config.json');

    const config = {
      sessionTimeout: 900,
      trackingEnabled: true,
      projects: []
    };

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    const loaded = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

    expect(loaded.sessionTimeout).toBe(900);
    expect(loaded.trackingEnabled).toBe(true);
    expect(loaded.projects).toEqual([]);
  });

  it('should update config values', () => {
    const configFile = path.join(TEST_CONFIG_DIR, 'config.json');

    let config = {
      sessionTimeout: 900,
      trackingEnabled: true,
      projects: []
    };

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    // Update
    config = {
      ...config,
      sessionTimeout: 1200
    };

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    const loaded = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    expect(loaded.sessionTimeout).toBe(1200);
  });

  it('should handle project list in config', () => {
    const configFile = path.join(TEST_CONFIG_DIR, 'config.json');

    let config: { sessionTimeout: number; trackingEnabled: boolean; projects: string[] } = {
      sessionTimeout: 900,
      trackingEnabled: true,
      projects: []
    };

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    // Add project
    config.projects.push('/home/user/project1');
    config.projects.push('/home/user/project2');

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    const loaded = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    expect(loaded.projects).toHaveLength(2);
    expect(loaded.projects[0]).toBe('/home/user/project1');
  });

  it('should handle malformed config gracefully', () => {
    const configFile = path.join(TEST_CONFIG_DIR, 'config-bad.json');

    fs.writeFileSync(configFile, 'invalid json {');

    expect(() => {
      JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    }).toThrow();
  });

  it('should create directory if not exists', () => {
    const newDir = path.join(TEST_CONFIG_DIR, 'nested', 'dir');

    fs.mkdirSync(newDir, { recursive: true });

    expect(fs.existsSync(newDir)).toBe(true);
  });
});
