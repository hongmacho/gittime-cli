import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { installHooks, uninstallHooks, hooksInstalled } from '../lib/hook-installer';

const TEST_REPO_PATH = path.join(__dirname, '../../test-repo');
const TEST_GIT_PATH = path.join(TEST_REPO_PATH, '.git');
const TEST_HOOKS_PATH = path.join(TEST_GIT_PATH, 'hooks');

describe('Hook Installer', () => {
  beforeEach(() => {
    // Create test repo structure
    fs.mkdirSync(TEST_HOOKS_PATH, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(TEST_REPO_PATH)) {
      fs.rmSync(TEST_REPO_PATH, { recursive: true });
    }
  });

  it('should install hooks successfully', () => {
    const result = installHooks(TEST_REPO_PATH);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should create post-checkout hook file', () => {
    installHooks(TEST_REPO_PATH);

    const postCheckoutPath = path.join(TEST_HOOKS_PATH, 'post-checkout');
    expect(fs.existsSync(postCheckoutPath)).toBe(true);
  });

  it('should create post-commit hook file', () => {
    installHooks(TEST_REPO_PATH);

    const postCommitPath = path.join(TEST_HOOKS_PATH, 'post-commit');
    expect(fs.existsSync(postCommitPath)).toBe(true);
  });

  it('should make hooks executable', () => {
    installHooks(TEST_REPO_PATH);

    const postCheckoutPath = path.join(TEST_HOOKS_PATH, 'post-checkout');
    const stats = fs.statSync(postCheckoutPath);

    // Check if executable (octal 755 = decimal 493)
    expect((stats.mode & 0o111) !== 0).toBe(true);
  });

  it('should detect installed hooks', () => {
    installHooks(TEST_REPO_PATH);

    const installed = hooksInstalled(TEST_REPO_PATH);
    expect(installed).toBe(true);
  });

  it('should return false for uninstalled hooks', () => {
    const installed = hooksInstalled(TEST_REPO_PATH);
    expect(installed).toBe(false);
  });

  it('should contain gittime-cli reference in hooks', () => {
    installHooks(TEST_REPO_PATH);

    const postCheckoutPath = path.join(TEST_HOOKS_PATH, 'post-checkout');
    const content = fs.readFileSync(postCheckoutPath, 'utf-8');

    expect(content).toContain('gittime-cli');
  });

  it('should uninstall hooks', () => {
    installHooks(TEST_REPO_PATH);

    // Verify installed first
    expect(hooksInstalled(TEST_REPO_PATH)).toBe(true);

    // Uninstall
    uninstallHooks(TEST_REPO_PATH);

    // Verify uninstalled
    const postCheckoutPath = path.join(TEST_HOOKS_PATH, 'post-checkout');
    const content = fs.readFileSync(postCheckoutPath, 'utf-8');

    expect(content).not.toContain('gittime-cli');
  });

  it('should create hooks even without existing .git directory', () => {
    const nonGitPath = path.join(__dirname, '../../non-git-repo');

    const result = installHooks(nonGitPath);

    // Should succeed because we create the directory structure
    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);

    // Cleanup
    if (fs.existsSync(nonGitPath)) {
      fs.rmSync(nonGitPath, { recursive: true });
    }
  });
});
