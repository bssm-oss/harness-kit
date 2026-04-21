# claude-harness-kit

[![npm](https://img.shields.io/npm/v/claude-harness-kit)](https://www.npmjs.com/package/claude-harness-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Community harness kit for Claude Code — multi-agent orchestration with 7 patterns and 8 specialist teams.

> **[한국어 문서](./README.ko.md)**

## Install

```bash
npm install -g claude-harness-kit
claude-harness-kit
```

> **Note:** `npx claude-harness-kit` does not work on npm 10+ due to changed binary resolution. Use global install.

After installation, agents and skills are available in `~/.claude/agents/` and `~/.claude/skills/`.

## Teams

| Team | Pattern | Agents | Skills | Use when |
|------|---------|:------:|:------:|----------|
| `dev-team` | Pipeline | 5 | 1 | Building a full feature (FE + BE + review + QA) |
| `review-team` | Fan-out/Fan-in | 6 | 2 | Auditing existing code, a PR, or full codebase |
| `fe-team` | Expert Pool + Reflection | 6 | 5 | React, Next.js, Tailwind, a11y, perf |
| `be-team` | Pipeline + Expert Pool + Reflection | 8 | 5 | Hono/Express API, LLM integration, MCP |
| `explore-team` | Hierarchical Delegation | 4 | 3 | Investigating codebase, root cause, arch review |
| `research-team` | Blackboard | 4 | 3 | Web research, library comparison, fact-gathering |
| `debate-team` | Adversarial Debate | 4 | 2 | Architecture decisions, trade-off analysis |
| `ops-team` | Skills + Hooks | 0 | 3 | Release, CI watch, orphan process cleanup |

## Patterns

| # | Pattern | Description |
|---|---------|-------------|
| 1 | Pipeline | Sequential stages — each stage's output feeds the next |
| 2 | Fan-out / Fan-in | Parallel workers, results aggregated by a moderator |
| 3 | Expert Pool | Route to domain specialist agent |
| 4 | Hybrid Pipeline + Expert Pool | Sequential stages, each stage is an expert |
| 5 | Hierarchical Delegation | Scout orchestrates, delegates to specialists |
| 6 | Adversarial Debate | Advocates argue positions, judge decides (max 5 rounds) |
| 7 | Blackboard | Shared state file; agents read/write with no explicit handoff |

Cross-cutting: Reflection Loop, Circuit Breaker, Escalation, Consensus Voting.

See [`docs/PATTERNS.md`](docs/PATTERNS.md) for full details.

## Usage

### Skills (slash commands)

```bash
# Frontend work
/fe-component "UserCard with avatar and role badge"
/fe-page "Dashboard with stats and recent activity"

# Backend work
/be-api "POST /invoices with Zod validation"
/be-mcp-server "GitHub integration MCP server"

# Review
/review-code src/auth/middleware.ts
/review-codebase src/ --screeners 5    # full codebase, 5 parallel screeners

# Research
/research-web "Compare Zustand vs Jotai for Next.js 15"

# Debate
/debate-tradeoff "SSR vs SPA for internal dashboard"

# Operations
/zombie-collector     # clean orphan processes
/release              # release workflow
/ci-watch             # monitor CI run
```

### Routing

Claude Code routes your request to the right team automatically based on triggers in `CLAUDE.md`. You can also be explicit:

```
"explore로 이 버그 조사해줘"
"review-team으로 PR #42 리뷰해"
"debate-team: Redis vs Memcached 결정해줘"
```

## Examples

See [`examples/`](examples/) for 5 real-world walkthroughs:

1. [Simple CRUD feature](examples/01-simple-feature.md) — dev-team
2. [Code review](examples/02-code-review.md) — review-team (SARIF output)
3. [Research task](examples/03-research-task.md) — research-team (Blackboard flow)
4. [Architecture decision](examples/04-architecture-decision.md) — debate-team
5. [Debugging + cleanup](examples/05-debugging-session.md) — explore-team → ops-team

## Uninstall

```bash
claude-harness-kit --uninstall
```

## Creating custom teams

See [`docs/CREATING_TEAMS.md`](docs/CREATING_TEAMS.md).

## License

MIT — [justn-hyeok](https://github.com/justn-hyeok)
