# gittime-cli - ROADMAP

## Phase 1: MVP (Core Features)
### Week 1-2: Foundation
- [x] 프로젝트 구조 설정 (src/, tests/)
- [x] TypeScript 설정 및 빌드 파이프라인
- [x] better-sqlite3 데이터베이스 스키마 구현
- [x] 글로벌 설정 저장소 (~/.gittime/config.json)

### Week 2-3: 핵심 기능
- [ ] init 커맨드: 초기화 및 hook 설치
- [ ] repos 커맨드: 저장소 관리
- [ ] status 커맨드: 오늘/주간/월간 대시보드
- [ ] adjust 커맨드: 시간 보정
- [ ] report 커맨드: 주간/월간 보고서

### Week 3-4: Hook 구현
- [ ] post-checkout hook 설치 및 동작
- [ ] post-commit hook 설치 및 동작
- [ ] 세션 감지 로직 (타임아웃 처리)
- [ ] 데이터 기록 및 집계

### Week 4-5: QA 및 최적화
- [ ] 단위 테스트 작성 (80% 커버리지)
- [ ] 통합 테스트
- [ ] 타입 체크 (tsc --noEmit)
- [ ] 빌드 및 패키지 검증

## Phase 2: Enhanced Features (Post-MVP)
### UI/UX 개선
- [ ] 컬러 테마 커스터마이징
- [ ] 진행 바 시각화
- [ ] 인터랙티브 대시보드

### 고급 분석
- [ ] 시간대별 분포 분석
- [ ] 주말/평일 비교
- [ ] 프로젝트별 트렌드

### 통합
- [ ] Slack 알림
- [ ] Google Calendar 연동
- [ ] GitHub API 통합

## Phase 3: Distribution
- [ ] npm publish
- [ ] GitHub 저장소 공개
- [ ] 문서 및 예제

## 마일스톤 체크리스트
- [x] PRD 작성
- [x] ROADMAP 작성
- [ ] 프로젝트 초기 설정 완료
- [ ] 모든 커맨드 구현 완료
- [ ] 테스트 작성 완료 (80%+)
- [ ] 빌드 성공 및 배포 준비
- [ ] GitHub 저장소 생성 및 push
