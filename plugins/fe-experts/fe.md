# Frontend Harness

React 19 / Next.js 15 App Router frontend development harness with Expert Pool + Producer-Reviewer orchestration.

## Team: fe

| Agent | Model | Role |
|-------|-------|------|
| fe-architect | sonnet | Component hierarchy, state management strategy, routing, expert pool delegation |
| fe-implementer | sonnet | React component implementation (server/client), Jotai atoms, data fetching |
| fe-styler | sonnet | Tailwind CSS, responsive design, dark mode, WCAG AA accessibility |
| fe-perf | sonnet | Bundle size, re-render audit, memoization, server/client boundary optimization |
| fe-tester | sonnet | Vitest + Testing Library (unit/component), Playwright (E2E) |

## Pattern: Expert Pool + Producer-Reviewer

```
User Request
    └─▶ fe-architect (design + routing)
            ├─▶ fe-implementer ────┐
            ├─▶ fe-styler          │ (sequential or parallel,
            │                      │  depending on skill)
            └─▶ Review gate:       │
                ├─▶ fe-perf   ─────┤ (parallel)
                └─▶ fe-tester ─────┘
```

### Flow

1. **fe-architect** decomposes the request, picks the component pattern (Server Component first), selects state strategy (Jotai atoms / RSC props / URL state), and writes a brief to `.claude/specs/fe-{slug}.md`
2. **fe-implementer** writes the component tree, data fetching, and interactivity boundaries
3. **fe-styler** applies Tailwind utilities, responsive breakpoints, dark mode, and a11y attributes
4. **fe-perf + fe-tester** run in parallel as the review gate — perf audits bundle/re-renders, tester writes Vitest + Playwright coverage
5. Architect reviews the consolidated output and delivers

## Skills

- `/fe-component` — Single component creation (architect → implementer → styler → parallel review)
- `/fe-page` — Next.js App Router page (page/layout/loading/error.tsx, metadata)
- `/fe-refactor` — Targeted refactor with goal-specific reviewer (perf / a11y / state)
- `/fe-review` — Parallel fe-perf + fe-tester audit on existing code (no implementation)
- `/fe-test` — Standalone test generation via fe-tester

## Trigger Keywords

"component", "React", "Next", "frontend", "page", "스타일", "a11y", "번들", "컴포넌트", "페이지"

## Conventions

- TypeScript strict mode, ESM
- React 19: use Server Components by default, mark client boundaries with `"use client"` explicitly
- Next.js 15 App Router only (no pages router)
- State: Jotai atoms for global client state, RSC props for server-derived, URL search params for shareable filters
- Styling: Tailwind utilities first, no CSS-in-JS, no `@apply` except in `globals.css`
- Accessibility: WCAG 2.1 AA minimum — semantic HTML, labeled controls, keyboard navigation
- Testing: Vitest + @testing-library/react for components, Playwright for E2E
- React Compiler assumed on — avoid manual `useMemo`/`useCallback` unless profiler proves need
- User-facing text in Korean, code/logs in English

## Delegation Mechanics

- fe-architect delegates to implementer/styler/reviewer via Claude Code's subagent invocation
- Parallel reviewers (fe-perf, fe-tester) must be launched in a single tool-use block for true parallelism

## Handoff Artifacts

Briefs and review reports written to `.claude/specs/fe-{feature-slug}.md`
