# gittime-cli

Git 활동 기반 자동 시간 추적 CLI — 클릭 0회

## 소개

gittime-cli는 git hook을 이용하여 개발자의 프로젝트별 작업 시간을 자동으로 추적하는 CLI 도구입니다. 수동 입력 없이 git 활동(브랜치 전환, 커밋)만으로 작업 시간을 기록하므로 개발자의 생산성 분석과 프로젝트 시간 추적에 도움이 됩니다.

## 특징

- **자동 추적**: git hook 기반으로 0 클릭 자동 추적
- **정확한 기록**: 브랜치 전환 및 커밋 감지를 통한 작업 세션 기록
- **다양한 보고서**: 오늘/주간/월간 대시보드 및 Markdown/CSV 보고서
- **유연한 조정**: 수동으로 시간 추가/차감 가능
- **프로젝트 관리**: 여러 저장소 등록 및 관리
- **한국어 지원**: 모든 메시지 및 출력이 한국어

## 설치

```bash
npm install -g gittime-cli
```

또는 로컬 개발:

```bash
npm install
npm run build
```

## 사용법

### 초기 설정

```bash
gittime init
```

### 저장소 등록

```bash
# 저장소 등록
gittime repos add /path/to/repository

# 등록된 저장소 목록
gittime repos list

# 저장소 제거
gittime repos remove /path/to/repository
```

### 작업 시간 확인

```bash
# 오늘의 작업 시간 (기본값)
gittime status

# 이번 주의 작업 시간
gittime status --range week

# 이번 달의 작업 시간
gittime status --range month
```

### 시간 보정

```bash
# 30분 추가
gittime adjust /path/to/repository add 30

# 15분 차감
gittime adjust /path/to/repository subtract 15

# 특정 날짜에 시간 추가
gittime adjust /path/to/repository add 30 --date 2024-01-15
```

### 보고서 생성

```bash
# Markdown 형식 (기본값)
gittime report

# CSV 형식
gittime report --format csv
```

### 설정 관리

```bash
# 설정 조회
gittime config show

# 세션 타임아웃 설정 (초 단위)
gittime config set sessionTimeout 1200

# 추적 활성화/비활성화
gittime config set trackingEnabled true

# 설정 초기화
gittime config reset
```

## 작동 원리

1. **초기화**: `gittime init` 명령어로 글로벌 설정과 데이터베이스 생성
2. **저장소 등록**: 추적할 git 저장소를 등록하면 hook 자동 설치
3. **git hook 설치**:
   - `post-checkout`: 브랜치 전환 시 실행
   - `post-commit`: 커밋 시 실행
4. **세션 기록**: 각 hook 실행 시 작업 세션을 데이터베이스에 기록
5. **시간 집계**: 등록된 저장소들의 모든 세션을 집계하여 보고서 생성

## 데이터 저장 위치

- 설정 파일: `~/.gittime/config.json`
- 데이터베이스: `~/.gittime/gittime.db`

## 프로젝트 구조

```
src/
├── index.ts              # CLI 진입점 (Commander.js)
├── commands/
│   ├── init.ts          # 초기화 명령어
│   ├── repos.ts         # 저장소 관리 명령어
│   ├── status.ts        # 상태 조회 명령어
│   ├── adjust.ts        # 시간 조정 명령어
│   ├── report.ts        # 보고서 생성 명령어
│   ├── config.ts        # 설정 관리 명령어
│   └── hook-internal.ts # 내부 hook 처리 명령어
├── lib/
│   ├── database.ts      # SQLite 데이터베이스 모듈
│   ├── config.ts        # 설정 관리 모듈
│   ├── utils.ts         # 유틸리티 함수
│   └── hook-installer.ts # git hook 설치/관리
└── __tests__/           # 테스트 파일
```

## 개발

### 빌드

```bash
npm run build
```

### 테스트

```bash
npm test
npm run test:coverage
```

### TypeScript 타입 확인

```bash
npm run lint
```

### 개발 모드

```bash
npm run dev -- --help
```

## 요구사항

- Node.js 18+
- npm 또는 yarn
- Git

## 의존성

- **commander**: CLI 프레임워크
- **better-sqlite3**: 로컬 데이터베이스
- **chalk**: 터미널 색상 출력
- **cli-table3**: 테이블 포맷팅

## 라이선스

MIT

## 기여

이슈와 풀 리퀘스트를 환영합니다!

## 변경 이력

### v1.0.0 (2024-06-04)

- 초기 릴리스
- 핵심 기능 구현: init, repos, status, adjust, report, config
- git hook 자동 설치 및 관리
- 다양한 시간 범위 지원 (오늘, 주간, 월간)
- 수동 시간 조정 기능
- Markdown/CSV 보고서 생성
