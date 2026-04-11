# harness-for-yall

[Claude Code](https://docs.anthropic.com/en/docs/claude-code)용 멀티에이전트 하네스: 에이전트 26개, 스킬 15개, 5개 팀.

> **[English](./README.md)**

## 이게 뭔데?

Claude Code 에이전트를 5개 전문 팀으로 조직한 사전 설정 패키지. 각 팀은 목적에 맞는 멀티에이전트 오케스트레이션 패턴을 사용한다.

## 팀 구성

| 플러그인 | 패턴 | 에이전트 | 스킬 | 하는 일 |
|---------|------|:-------:|:----:|--------|
| `dev-pipeline` | Pipeline | 5 | 1 | 기능 개발 전체: 기획 → FE+BE 병렬 → 리뷰 게이트 → QA |
| `review-pipeline` | Fan-out / Fan-in | 5 | 1 | 코드 리뷰: 3개 스크리너 병렬 → 모더레이터 → 판정 (SARIF 출력) |
| `fe-experts` | Expert Pool | 5 | 5 | 프론트엔드: 아키텍트 → 구현/스타일 → 성능 + 테스트 |
| `be-experts` | Pipeline + Expert Pool | 7 | 5 | 백엔드: 아키텍트 → 구현+검증 → 회복성/프로바이더/보안 → 테스트 |
| `explore-team` | Hierarchical Delegation | 4 | 3 | 코드베이스 탐색: 스카우트(opus) → 가설 → 증거 → 종합 |

## 설치

### 방법 1 — npx

```bash
# 전체 설치
npx harness-for-yall

# 원하는 팀만 골라서
npx harness-for-yall fe-experts be-experts

# 미리보기
npx harness-for-yall --dry-run

# 기존 파일 덮어쓰기
npx harness-for-yall --force
```

`~/.claude/`에 에이전트/스킬 파일을 복사한다. 의존성 없음.

### 방법 2 — Plugin Marketplace

Claude Code 안에서:

```
/plugin marketplace add bssm-oss/harness-for-yall
```

필요한 팀 설치:

```
/plugin install dev-pipeline@justn-harness
/plugin install review-pipeline@justn-harness
/plugin install fe-experts@justn-harness
/plugin install be-experts@justn-harness
/plugin install explore-team@justn-harness
```

### 방법 3 — 쉘 스크립트

```bash
git clone https://github.com/bssm-oss/harness-for-yall.git
cd harness-for-yall
chmod +x install.sh && ./install.sh
```

## 아키텍처

```
                    ┌─────────────┐
                    │   사용자 요청  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  특화 팀   │ │  범용 팀   │ │  분석 팀   │
        │ fe / be  │ │   dev    │ │ explore  │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             ▼             ▼             ▼
        ┌──────────────────────────────────────┐
        │          review-pipeline             │
        │  스크리너×3 → 모더레이터 → 판정관       │
        └──────────────────────────────────────┘
```

### 라우팅 규칙

1. **구체성 우선** — 프론트/백엔드 특화 작업이면 `dev-*` 말고 `fe-*` / `be-*` 선택
2. **체이닝 가능** — `explore → dev → review`로 복잡한 워크플로우 연결
3. **과잉이면 생략** — 한 줄 수정이나 단순 질문에 하네스는 불필요

### 모델 전략

| 에이전트 | 모델 | 이유 |
|---------|------|------|
| `explore-scout` | opus | 아키텍처 분석 오케스트레이션에는 판단력이 중요 |
| 나머지 전부 | sonnet | 비용 효율 — 구현 작업은 sonnet으로 충분 |

## 팀별 상세

### dev-pipeline (기능 개발)

```
사용자 요청 → dev-planner (기획)
                  ↓
        dev-frontend + dev-backend (병렬 구현)
                  ↓
            dev-reviewer (리뷰 게이트)
                  ↓
              dev-qa (테스트)
```

**스킬:** `/dev-feature` — 기능 개발 전체 파이프라인 실행

### review-pipeline (코드 리뷰)

```
코드/PR → review-screener-1 (정확성)  ──┐
       → review-screener-2 (보안)     ──┼→ review-moderator → review-judge
       → review-screener-3 (성능/스타일) ─┘        (통합)         (판정)
```

**스킬:** `/review-code` — SARIF v2.1.0 호환 리포트 출력

### fe-experts (프론트엔드)

```
요청 → fe-architect (설계)
           ├→ fe-implementer (구현)
           ├→ fe-styler (스타일/접근성)
           ├→ fe-perf (성능 리뷰)
           └→ fe-tester (테스트)
```

**스킬:** `/fe-component`, `/fe-page`, `/fe-refactor`, `/fe-review`, `/fe-test`

### be-experts (백엔드)

```
요청 → be-architect (API 설계)
           ├→ be-implementer + be-validator (병렬)
           ├→ be-resilience (회로 차단기/재시도)
           ├→ be-provider (LLM 멀티프로바이더)
           ├→ be-security (AuthN/Z, 시크릿, CORS, 감사로그, OWASP)
           └→ be-tester (계약 테스트)
```

**스킬:** `/be-api`, `/be-mcp-server`, `/be-pipeline`, `/be-llm-integration`, `/be-observability`

### explore-team (코드베이스 탐색)

```
질문 → explore-scout (opus, 정찰 + 오케스트레이션)
           ├→ explore-hypothesizer (경쟁 가설 생성)
           ├→ explore-evidence (증거 수집)
           └→ explore-synthesizer (아키텍처 리포트)
```

**스킬:** `/explore-investigate`, `/explore-quick`, `/explore-hypothesis`

## 커스터마이징

각 에이전트는 YAML frontmatter가 있는 독립 `.md` 파일. 자유롭게 수정 가능:

```yaml
---
name: fe-architect
description: "React/Next.js component architecture"
model: sonnet          # opus로 바꾸면 업그레이드
tools:
  - Read
  - Glob
  - Grep
---
```

스킬은 `plugins/<팀>/skills/<이름>/SKILL.md` 형태. 새 스킬을 추가하려면 같은 구조로 폴더 만들면 된다.

## 라이선스

MIT
