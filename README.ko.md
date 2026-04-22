# harnesses

[![npm](https://img.shields.io/npm/v/harnesses)](https://www.npmjs.com/package/harnesses)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Claude Code용 커뮤니티 하네스 킷 — 7가지 패턴, 8개 전문 팀으로 구성된 멀티에이전트 오케스트레이션.

> **[English](./README.md)**

## 설치

```bash
npm install -g harnesses
```

> **참고:** npm 10+ 환경에서는 `npx harnesses`이 동작하지 않습니다. 전역 설치를 사용하세요.

### Claude Code (기본)

```bash
harnesses                  # 전체 팀 설치 → ~/.claude/
harnesses --claude         # 동일, 명시적 지정
harnesses be-team fe-team  # 특정 팀만 선택
```

에이전트와 스킬이 `~/.claude/agents/`와 `~/.claude/commands/`에 설치됩니다.

### Codex / OpenAI

```bash
harnesses --codex          # codex-harnesses Python 패키지 설치
```

Python 3.11+와 `uv`(권장) 또는 `pip3` 필요. 설치 후:

```bash
codex-harnesses "PostgreSQL vs MongoDB?" --option-a PostgreSQL --option-b MongoDB
```

Codex CLI 기반 적대적 토론 파이프라인 실행 — advocate-a → advocate-b → devil's advocate → judge. Codex 에이전트가 코드베이스 파일을 직접 읽어 증거 기반 논거를 구성합니다.

## 팀 구성

| 팀 | 패턴 | 에이전트 | 스킬 | 언제 사용 |
|----|------|:--------:|:----:|-----------|
| `dev-team` | Pipeline | 5 | 1 | 풀스택 기능 개발 (FE + BE + 리뷰 + QA) |
| `review-team` | Fan-out/Fan-in | 6 | 2 | 코드/PR 리뷰 및 전체 코드베이스 감사 |
| `fe-team` | Expert Pool + Reflection | 6 | 5 | React, Next.js, Tailwind, a11y, 성능 |
| `be-team` | Pipeline + Expert Pool + Reflection | 8 | 5 | Hono/Express API, LLM 통합, MCP |
| `explore-team` | Hierarchical Delegation | 4 | 3 | 코드베이스 조사, 근본 원인 분석 |
| `research-team` | Blackboard | 4 | 3 | 웹 리서치, 라이브러리 비교, 사실 수집 |
| `debate-team` | Adversarial Debate | 4 | 2 | 아키텍처 결정, 트레이드오프 분석 |
| `ops-team` | Skills + Hooks | 0 | 3 | 릴리즈, CI 감시, 좀비 프로세스 정리 |

## 패턴

| # | 패턴 | 설명 |
|---|------|------|
| 1 | Pipeline | 순차적 변환 — 각 단계 출력이 다음 단계 입력 |
| 2 | Fan-out / Fan-in | 병렬 작업 후 모더레이터가 결과 통합 |
| 3 | Expert Pool | 도메인별 전문 에이전트로 라우팅 |
| 4 | Pipeline + Expert Pool | 순차 파이프라인, 각 단계가 전문가 |
| 5 | Hierarchical Delegation | 스카우트 오케스트레이터 → 전문가에 위임 |
| 6 | Adversarial Debate | 옹호자들이 논쟁, 심판이 최종 결정 (최대 5라운드) |
| 7 | Blackboard | 공유 파일 상태; 에이전트가 명시적 핸드오프 없이 읽기/쓰기 |

Cross-cutting: Reflection Loop, Circuit Breaker, Escalation, Consensus Voting.

전체 내용은 [`docs/PATTERNS.md`](docs/PATTERNS.md) 참조.

## 사용법

### 스킬 (슬래시 커맨드)

```bash
# 프론트엔드
/fe-component "아바타와 역할 뱃지가 있는 UserCard"
/fe-page "통계와 최근 활동이 있는 대시보드"

# 백엔드
/be-api "Zod 검증이 포함된 POST /invoices"
/be-mcp-server "GitHub 연동 MCP 서버"

# 리뷰
/review-code src/auth/middleware.ts
/review-codebase src/ --screeners 5    # 전체 코드베이스, 5개 병렬 스크리너

# 리서치
/research-web "Next.js 15에서 Zustand vs Jotai 비교"

# 토론
/debate-tradeoff "내부 대시보드에 SSR vs SPA"

# 운영
/zombie-collector     # 고아 프로세스 정리
/release              # 릴리즈 워크플로우
/ci-watch             # CI 실행 감시
```

### 라우팅

CLAUDE.md의 트리거를 기반으로 자동 라우팅됩니다. 명시적 지정도 가능합니다:

```
"explore로 이 버그 조사해줘"
"review-team으로 PR #42 리뷰해"
"debate-team: Redis vs Memcached 결정해줘"
```

## 예시

실제 시나리오 5개는 [`examples/`](examples/)를 참조:

1. [단순 CRUD 기능](examples/01-simple-feature.md) — dev-team
2. [코드 리뷰](examples/02-code-review.md) — review-team (SARIF 출력)
3. [리서치 작업](examples/03-research-task.md) — research-team (Blackboard 흐름)
4. [아키텍처 결정](examples/04-architecture-decision.md) — debate-team
5. [디버깅 + 정리](examples/05-debugging-session.md) — explore-team → ops-team

## 제거

```bash
harnesses --uninstall               # Claude Code: ~/.claude/에서 제거
uv tool uninstall codex-harnesses   # Codex: Python 패키지 제거
```

## 커스텀 팀 생성

[`docs/CREATING_TEAMS.md`](docs/CREATING_TEAMS.md) 참조.

## 라이선스

MIT — [justn-hyeok](https://github.com/justn-hyeok)
