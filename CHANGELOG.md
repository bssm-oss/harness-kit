# Changelog

## [0.1.1] - 2026-04-22

### Fixed
- `scripts/install.sh` / `uninstall.sh`: replace `((n++))` with `n=$((n+1))` — safe under `set -e`
- `scripts/install.sh`: add hooks copy block; exclude `AGENTS.md` from harnesses
- `scripts/uninstall.sh`: add hooks remove block; exclude `AGENTS.md` from harnesses
- `bin/install.mjs`: uninstall now excludes `AGENTS.md` from harnesses, filters hooks to `.sh` + `isFile()`
- `bin/install.mjs`: dry-run now accurately reports copy vs skip counts
- CI: remove stale `master` branch trigger; bump Node matrix to `[20, 22]`
- Release: add `if: success()` guard before GitHub Release step

## [0.1.0] - 2026-04-22

### Initial stable release

Complete redesign from harness-for-yall v0.x.

### Renamed

- Package: `harness-for-yall` → `claude-harness-kit`
- All plugin directories renamed to `<name>-team` convention:
  - `dev-pipeline` → `dev-team`
  - `review-pipeline` → `review-team`
  - `fe-experts` → `fe-team`
  - `be-experts` → `be-team`
  - `ops-kit` → `ops-team`

### Added

#### New orchestration patterns
- **Adversarial Debate** (`debate-team`): advocate-a + advocate-b + devils-advocate → judge
- **Blackboard** (`research-team`): shared state file consumed by parallel agents
- **Reflection Loop** (`fe-reflector`, `be-reflector`): post-implementation self-critique
- **Circuit Breaker**: cross-cutting pattern docs in `core/patterns/`
- **Escalation**: Expert Pool escalation path docs

#### New teams
- `research-team` (4 agents, 3 skills): Blackboard-based long-running research
- `debate-team` (4 agents, 2 skills): Adversarial debate for contested decisions

#### New agents
- `fe-reflector`: post-implementation reflection for frontend
- `be-reflector`: post-implementation reflection for backend

#### New skills
- `ops-team/zombie-collector`: detects orphan Claude Code processes, confirms before killing

#### Structure
- `core/`: shared pattern docs and schemas (blackboard, trace)
- `docs/`: PATTERNS.md, AGENTS_MD_STANDARD.md, DESCRIPTION_FORMULA.md, CREATING_TEAMS.md, TRACE_LOG.md
- `examples/`: 5 real-world scenario walkthroughs
- `scripts/`: install.sh + uninstall.sh (moved from root)
- `.github/`: CI + release workflows, issue templates
- `AGENTS.md` in every team directory following standard format

### Improved

- All 36 agent descriptions rewritten: "Use when [TRIGGER]; handles [ACTION]" formula
- `bin/install.mjs`: hooks installation support (ops-team/hooks/ → ~/.claude/hooks/)
- `bin/uninstall.mjs`: hooks cleanup support

### Migration from v0.x

Run `npx claude-harness-kit --force` to overwrite old installation.
Directory names changed — old `*-pipeline`/`*-experts`/`*-kit` names are gone.
