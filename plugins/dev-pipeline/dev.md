# Dev Harness

Full-stack feature delivery pipeline — planning → parallel implementation → review gate → QA.

## Team: dev

| Agent | Model | Role |
|-------|-------|------|
| dev-planner | sonnet | Requirement analysis, spec authoring, FE/BE task decomposition |
| dev-frontend | sonnet | Frontend implementation (React/Next.js/TS), reuses existing components |
| dev-backend | sonnet | Backend implementation (Node/Express or equivalent), API contracts, validation |
| dev-reviewer | sonnet | Correctness / security / style / integration review, APPROVE / REQUEST_CHANGES gate |
| dev-qa | sonnet | Unit + integration tests, edge case coverage, regression checks |

## Pattern: Pipeline with Parallel Implementation

```
User Request
    └─▶ dev-planner (spec + approval)
            ├─▶ dev-frontend ──┐ (parallel implementation)
            ├─▶ dev-backend ───┘
            └─▶ dev-reviewer (gate)
                    └─▶ dev-qa (only after APPROVE)
                            └─▶ final report
```

### Flow

1. **dev-planner** writes `.claude/specs/dev-{slug}.md`, decomposes into `FE-N` / `BE-N` tasks with acceptance criteria; **user approval required before Step 2**
2. **dev-frontend + dev-backend** run in parallel, each appending their own implementation notes section to the spec
3. **dev-reviewer** gates: `REQUEST_CHANGES` loops back to implementers; `APPROVE` unlocks Step 4
4. **dev-qa** runs tests (skip blocked until reviewer APPROVE)
5. Final report generated summarizing spec + review + QA results

## Skills

- `/dev-feature` — End-to-end feature pipeline

## Trigger Keywords

"기능", "구현", "build feature", "ship", "full-stack", "신규 기능"

## Handoff: `.claude/specs/dev-{slug}.md`

```
# Feature: {name}

## 개요
{요구사항 요약}

## 태스크 분해
### Frontend
- [ ] FE-1: {description}
  AC: {acceptance criteria}

### Backend
- [ ] BE-1: {description}
  AC: {acceptance criteria}

## 의존성
## 리스크

## Frontend 구현 노트   ← dev-frontend가 완료 후 추가
## Backend 구현 노트    ← dev-backend가 완료 후 추가
## 리뷰 결과           ← dev-reviewer가 추가 (APPROVE / REQUEST_CHANGES)
## QA 결과             ← dev-qa가 추가
```

### Concurrent-write rule

Frontend and backend run in parallel and both append to the same spec file. To avoid merge conflicts:
- Each agent appends under **its own named section only** (never edits the other's)
- Agents must `Read` the spec immediately before `Edit` to pick up the latest content
- Shared fields (dependencies, risks) are owned by planner and are read-only after Step 1

## When to use dev-* vs fe-*/be-*

Use **dev-*** when the task spans both frontend and backend and you want a single coordinated pipeline with a review gate and QA.

Use **fe-*** / **be-*** when the task is confined to one side and you need specialist depth (e.g., bundle optimization, LLM provider adapter, circuit breaker design). Specialists go deeper than dev-frontend/dev-backend but don't orchestrate cross-stack delivery.

Decision tree:

```
Is the task full-stack (both FE and BE changes)?
├─ Yes → dev-*  (pipeline handles coordination + review gate)
└─ No  → Is it FE-only or BE-only?
          ├─ FE-only → Needs deep specialist (perf/a11y/state)?
          │             ├─ Yes → fe-*
          │             └─ No  → dev-frontend (if part of a larger dev-* flow)
          │                       or inline implementation for trivial changes
          └─ BE-only → Needs deep specialist (LLM/resilience/MCP)?
                        ├─ Yes → be-*
                        └─ No  → dev-backend or inline for trivial changes
```

## Conventions

- TypeScript strict mode across FE and BE
- API contracts agreed at spec time, verified by reviewer
- User-facing output in Korean, code/logs in English
- Reviewer uses BLOCKER / HIGH / MEDIUM / LOW severity (aligned with review-* harness)
