import { writeFileSync, existsSync, mkdirSync, chmodSync, readFileSync } from 'fs';
import path from 'path';

const POST_CHECKOUT_HOOK = `#!/bin/bash

# gittime-cli post-checkout hook
# 브랜치 전환 시 세션 기록

REPO_DIR="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_DIR" ]; then
  exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date +%s)

# gittime-cli 명령어가 있으면 실행 (있으면 실행, 없으면 무시)
if command -v gittime &> /dev/null; then
  gittime __hook-session-change "$REPO_DIR" "$BRANCH" "$TIMESTAMP" 2>/dev/null || true
fi
`;

const POST_COMMIT_HOOK = `#!/bin/bash

# gittime-cli post-commit hook
# 커밋 시 세션 유지

REPO_DIR="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_DIR" ]; then
  exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date +%s)

# gittime-cli 명령어가 있으면 실행
if command -v gittime &> /dev/null; then
  gittime __hook-session-update "$REPO_DIR" "$BRANCH" "$TIMESTAMP" 2>/dev/null || true
fi
`;

export function installHooks(repositoryPath: string): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  const hooksDir = path.join(repositoryPath, '.git', 'hooks');

  // Create hooks directory if it doesn't exist
  if (!existsSync(hooksDir)) {
    try {
      mkdirSync(hooksDir, { recursive: true });
    } catch (error) {
      errors.push(`hooks 디렉토리를 생성할 수 없습니다: ${repositoryPath}`);
      return { success: false, errors };
    }
  }

  // Install post-checkout hook
  const postCheckoutPath = path.join(hooksDir, 'post-checkout');
  try {
    writeFileSync(postCheckoutPath, POST_CHECKOUT_HOOK, 'utf-8');
    chmodSync(postCheckoutPath, 0o755);
  } catch (error) {
    errors.push('post-checkout hook를 설치할 수 없습니다');
  }

  // Install post-commit hook
  const postCommitPath = path.join(hooksDir, 'post-commit');
  try {
    writeFileSync(postCommitPath, POST_COMMIT_HOOK, 'utf-8');
    chmodSync(postCommitPath, 0o755);
  } catch (error) {
    errors.push('post-commit hook를 설치할 수 없습니다');
  }

  return { success: errors.length === 0, errors };
}

export function uninstallHooks(repositoryPath: string): void {
  const hooksDir = path.join(repositoryPath, '.git', 'hooks');
  const postCheckoutPath = path.join(hooksDir, 'post-checkout');
  const postCommitPath = path.join(hooksDir, 'post-commit');

  // Remove hooks by clearing them (not deleting to avoid issues with other hooks)
  if (existsSync(postCheckoutPath)) {
    const content = readFileSync(postCheckoutPath, 'utf-8');
    if (content.includes('gittime-cli')) {
      writeFileSync(postCheckoutPath, '#!/bin/bash\n', 'utf-8');
    }
  }

  if (existsSync(postCommitPath)) {
    const content = readFileSync(postCommitPath, 'utf-8');
    if (content.includes('gittime-cli')) {
      writeFileSync(postCommitPath, '#!/bin/bash\n', 'utf-8');
    }
  }
}

export function hooksInstalled(repositoryPath: string): boolean {
  const hooksDir = path.join(repositoryPath, '.git', 'hooks');
  const postCheckoutPath = path.join(hooksDir, 'post-checkout');
  const postCommitPath = path.join(hooksDir, 'post-commit');

  if (!existsSync(postCheckoutPath) || !existsSync(postCommitPath)) {
    return false;
  }

  try {
    const checkoutContent = readFileSync(postCheckoutPath, 'utf-8');
    const commitContent = readFileSync(postCommitPath, 'utf-8');

    return (
      checkoutContent.includes('gittime-cli') &&
      commitContent.includes('gittime-cli')
    );
  } catch (error) {
    return false;
  }
}
