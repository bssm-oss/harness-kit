# harness-for-yall

Multi-agent harness for [Claude Code](https://docs.anthropic.com/en/docs/claude-code): 25 agents, 15 skills, 5 teams.

> **[한국어 문서](./README.ko.md)**

## What is this?

A pre-configured set of Claude Code agents organized into 5 specialized teams. Each team uses a different multi-agent orchestration pattern optimized for its purpose.

## Teams

| Plugin | Pattern | Agents | Skills | What it does |
|--------|---------|:------:|:------:|-------------|
| `dev-pipeline` | Pipeline | 5 | 1 | Full feature dev: planner → FE+BE parallel → reviewer gate → QA |
| `review-pipeline` | Fan-out / Fan-in | 5 | 1 | Code review: 3 parallel screeners → moderator → judge (SARIF output) |
| `fe-experts` | Expert Pool | 5 | 5 | Frontend: architect → implementer / styler → perf + tester |
| `be-experts` | Pipeline + Expert Pool | 6 | 5 | Backend: architect → impl + validator → resilience / provider → tester |
| `explore-team` | Hierarchical Delegation | 4 | 3 | Codebase exploration: scout(opus) → hypothesizer → evidence → synthesizer |

## Install

### Option 1 — npx

```bash
# All plugins
npx claude-code-harness

# Pick specific teams
npx claude-code-harness fe-experts be-experts

# Preview first
npx claude-code-harness --dry-run

# Overwrite existing
npx claude-code-harness --force
```

Copies agents/skills to `~/.claude/`. Zero dependencies.

### Option 2 — Plugin Marketplace

Inside Claude Code:

```
/plugin marketplace add bssm-oss/harness-for-yall
```

Then install what you need:

```
/plugin install dev-pipeline@justn-harness
/plugin install review-pipeline@justn-harness
/plugin install fe-experts@justn-harness
/plugin install be-experts@justn-harness
/plugin install explore-team@justn-harness
```

### Option 3 — Shell script

```bash
git clone https://github.com/bssm-oss/harness-for-yall.git
cd harness-for-yall
chmod +x install.sh && ./install.sh
```

## Architecture

```
                    ┌─────────────┐
                    │  User Task  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Specific │ │ Generic  │ │ Analysis │
        │ fe / be  │ │   dev    │ │ explore  │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             ▼             ▼             ▼
        ┌──────────────────────────────────────┐
        │            review-pipeline           │
        │  screener×3 → moderator → judge      │
        └──────────────────────────────────────┘
```

### Routing Rules

1. **Specificity first** — `fe-*` / `be-*` over `dev-*` when the task is clearly frontend or backend
2. **Chainable** — `explore → dev → review` for complex workflows
3. **Skip when overkill** — One-line fixes and simple questions don't need a harness

### Model Strategy

| Agent | Model | Why |
|-------|-------|-----|
| `explore-scout` | opus | Orchestration quality matters for architecture analysis |
| Everything else | sonnet | Cost efficiency — sonnet handles implementation well |

## Structure

```
.claude-plugin/
  marketplace.json        # Plugin Marketplace catalog
plugins/
  dev-pipeline/           # 5 agents, 1 skill
    .claude-plugin/plugin.json
    agents/               # dev-planner, dev-frontend, dev-backend, dev-reviewer, dev-qa
    skills/dev-feature/
  review-pipeline/        # 5 agents, 1 skill
    agents/               # review-screener-{1,2,3}, review-moderator, review-judge
    skills/review-code/
  fe-experts/             # 5 agents, 5 skills
    agents/               # fe-architect, fe-implementer, fe-styler, fe-perf, fe-tester
    skills/               # fe-component, fe-page, fe-refactor, fe-review, fe-test
  be-experts/             # 6 agents, 5 skills
    agents/               # be-architect, be-implementer, be-validator, be-resilience, be-provider, be-tester
    skills/               # be-api, be-mcp-server, be-pipeline, be-llm-integration, be-observability
  explore-team/           # 4 agents, 3 skills
    agents/               # explore-scout, explore-hypothesizer, explore-evidence, explore-synthesizer
    skills/               # explore-investigate, explore-quick, explore-hypothesis
bin/install.mjs           # npx CLI
package.json              # npm config
install.sh                # Shell installer
uninstall.sh              # Shell uninstaller
```

## Customization

Each agent is a standalone `.md` file with YAML frontmatter. Edit freely:

```yaml
---
name: fe-architect
description: "React/Next.js component architecture"
model: sonnet          # change to opus if you want
tools:
  - Read
  - Glob
  - Grep
---
```

Skills are in `SKILL.md` format inside named folders. Add your own by creating `plugins/<team>/skills/<name>/SKILL.md`.

## License

MIT
