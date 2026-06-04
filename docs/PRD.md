# gittime-cli - PRD (Product Requirements Document)

## 개요
Git 활동 기반 자동 시간 추적기 (gittime-cli)는 git hook을 이용하여 개발자의 프로젝트별 작업 시간을 자동으로 추적하는 CLI 도구입니다. 수동 입력 없이 git 활동만으로 작업 시간을 기록하므로 개발자의 생산성 분석과 프로젝트 시간 추적에 도움이 됩니다.

## 목표
- **자동화**: Git hook 기반으로 0 클릭 자동 추적
- **정확성**: 브랜치 전환 및 커밋을 통한 작업 세션 감지
- **가시성**: 날짜/주간/월간 대시보드 제공
- **유연성**: 수동 보정 및 프로젝트 관리 기능

## 핵심 기능

### 1. 초기화 (init)
- `gittime-cli init` 명령어로 글로벌 설정 초기화
- ~/.gittime/ 디렉토리 생성
- 글로벌 SQLite 데이터베이스 초기화
- Git hook 설치 관련 정보 안내

### 2. 저장소 관리 (repos)
- 프로젝트 저장소 등록/해제
- 추적 대상 저장소 목록 조회
- 저장소별 설정 저장

### 3. 자동 시간 추적 (hooks)
- post-checkout hook: 브랜치 전환 감지
- post-commit hook: 커밋 감지
- 작업 세션 자동 기록 (시작/종료)
- 세션 간격 설정 (기본값: 15분)

### 4. 상태 조회 (status)
- 오늘의 작업 시간 (프로젝트별)
- 이번 주의 작업 시간 (요일별)
- 이번 달의 작업 시간 (주별)
- 현재 활성 브랜치 및 예상 시간

### 5. 보고서 생성 (report)
- 주간 보고서 (Markdown)
- CSV 형식 내보내기
- 프로젝트별 통계
- 시간대별 분포

### 6. 시간 보정 (adjust)
- 특정 날짜에 시간 추가
- 특정 날짜에 시간 차감
- 수동 기록 조정

### 7. 설정 관리 (config)
- 세션 타임아웃 시간 설정
- 프로젝트별 태그 관리
- 추적 활성/비활성화
- 설정 조회

## 데이터 모델

### Sessions 테이블
- id (PK)
- repository_path
- branch
- start_time
- end_time
- duration_seconds
- created_at

### Projects 테이블
- id (PK)
- repository_path (unique)
- project_name
- enabled
- created_at

### Tags 테이블
- id (PK)
- session_id (FK)
- tag_name

## 사용 시나리오

### 시나리오 1: 새로운 개발자의 셋업
1. `gittime-cli init` 실행
2. 작업 저장소들을 `gittime-cli repos add` 로 등록
3. 자동으로 git hook이 설치되어 추적 시작

### 시나리오 2: 일일 생산성 확인
1. `gittime-cli status` 명령어로 오늘의 작업 시간 확인
2. 프로젝트별 상세 통계 조회
3. 필요시 `gittime-cli adjust` 로 수동 보정

### 시나리오 3: 주간 리뷰
1. `gittime-cli report --format weekly` 로 주간 보고서 생성
2. Markdown 형식으로 저장 또는 공유
3. 프로젝트별 시간 분배 분석

## 기술 스택
- Node.js + TypeScript
- Commander.js (CLI 프레임워크)
- better-sqlite3 (로컬 데이터베이스)
- chalk (터미널 색상 출력)
- cli-table3 (테이블 포맷팅)

## 구현 범위
- 모든 출력 메시지 한국어
- 색상 코딩된 CLI 인터페이스
- 테이블 형식 대시보드
- 오류 처리 및 입력 검증
- 80% 이상의 테스트 커버리지
