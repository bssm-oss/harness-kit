# Review Harness

Multi-stage code review with fan-out/fan-in screening and producer-reviewer moderation.

## Team: review

| Agent | Model | Role |
|-------|-------|------|
| review-screener-1 | sonnet | Correctness — logic errors, null refs, type mismatches, API misuse |
| review-screener-2 | sonnet | Security — injection, auth/authz flaws, secret exposure, crypto misuse |
| review-screener-3 | sonnet | Performance & style — algorithmic complexity, N+1, duplication, naming |
| review-moderator | sonnet | Deduplicates, resolves conflicts, validates severity across screener outputs |
| review-judge | sonnet | Final verdict (APPROVE / BLOCK) and SARIF report generation |

## Pattern: Fan-Out / Fan-In + Producer-Reviewer

```
User Request (code / PR / diff)
    └─▶ [ screener-1, screener-2, screener-3 ]   ← parallel (fan-out)
            └─▶ review-moderator                ← consolidation (fan-in)
                    └─▶ review-judge
                            └─▶ review-report.sarif.json + human summary
```

### Flow

1. **Parallel screening** — screener-1/2/3 launched in a **single tool-use block** (required for true parallelism); each produces findings in SARIF-compatible JSON
2. **review-moderator** merges: deduplicates overlapping findings, resolves conflicts using priority `security > correctness > performance > style`, normalizes severity
3. **review-judge** applies decision framework, produces final verdict, writes `review-report.sarif.json` + human-readable summary

## Skills

- `/review-code` — Full review pipeline over given files or PR diff

## Trigger Keywords

"리뷰", "review", "audit", "검토", "PR 검토", "code review"

## Severity Scale (consistent across all agents)

| Level | Meaning | SARIF `level` |
|-------|---------|---------------|
| BLOCKER | Must fix before merge — data loss, security, broken prod | error |
| HIGH | Should fix before merge — correctness, significant risk | error |
| MEDIUM | Fix soon — maintainability, minor bugs | warning |
| LOW | Optional — style, nitpicks | note |

## SARIF Output Contract

Every finding must include:

```json
{
  "ruleId": "{category}/{rule-name}",
  "level": "error|warning|note",
  "message": { "text": "..." },
  "locations": [{
    "physicalLocation": {
      "artifactLocation": { "uri": "path/to/file" },
      "region": { "startLine": 42, "endLine": 45 }
    }
  }],
  "properties": {
    "severity": "BLOCKER|HIGH|MEDIUM|LOW",
    "category": "correctness|security|performance|style",
    "confidence": 0.0-1.0,
    "suggestion": "concrete fix"
  }
}
```

Categories:
- `correctness/*` — screener-1
- `security/*` — screener-2
- `performance/*`, `style/*` — screener-3

## Parallel Execution Requirement

Screeners MUST be launched in a single tool-use block (e.g., one message with three `Agent` tool calls). Sequential invocation defeats the fan-out design and wastes latency budget.

## Conventions

- Screeners never modify files (read-only review)
- Moderator and judge never modify source code — only generate reports
- User-facing output in Korean, code references in English
- Reports written to `review-report.sarif.json` in project root or `.claude/reviews/`
- Moderator preserves `confidence` from each screener so judge can weight accordingly

## Handoff Artifacts

- `review-report.sarif.json` — machine-readable, CI-ingestible
- Human summary in chat — verdict, risk level, finding counts by severity
