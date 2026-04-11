# Backend Harness

Node.js backend development harness for Hono/Express with multi-agent LLM orchestration support.

## Team: be

| Agent | Model | Role |
|-------|-------|------|
| be-architect | sonnet | API design, resource modeling, route structure, middleware layering, error strategy |
| be-implementer | sonnet | Hono/Express implementation, route handlers, middleware, DI patterns |
| be-validator | sonnet | Zod schemas, OpenAPI generation, RFC 9457 error responses, input sanitization |
| be-resilience | sonnet | Circuit breakers, retries, timeouts, graceful degradation, health checks |
| be-provider | sonnet | Multi-provider LLM adapters, streaming, token/cost tracking, rate limiting |
| be-security | sonnet | AuthN/AuthZ, secret management, CORS, audit logging, OWASP Top 10 defense |
| be-tester | sonnet | Vitest + Supertest contract tests, provider mocking, fixture management |

## Pattern: Pipeline with Expert Pool Fallback

```
User Request
    └─▶ be-architect (design)
            ├─▶ be-implementer  ─┐ (parallel)
            ├─▶ be-validator    ─┘
            ├─▶ be-resilience (if external APIs involved)
            ├─▶ be-provider (if LLM integration involved)
            ├─▶ be-security (if auth/data/privileged routes involved)
            └─▶ be-tester (every change)
```

### Flow

1. **be-architect** designs API structure, writes spec to `.claude/specs/be-{slug}.md`
2. **be-implementer + be-validator** work in parallel (implementation + schema/validation)
3. **be-resilience** adds circuit breakers/retries if external calls exist
4. **be-provider** adds LLM adapter layer if LLM integration is needed
5. **be-security** enforces auth/authz, secret handling, CORS, and audit logging for any route touching user data or privileged operations
6. **be-tester** writes contract tests for every change (mandatory gate)

## Skills

- `/be-api` — REST/RPC endpoint creation with validation and error handling
- `/be-mcp-server` — MCP server scaffolding (stdio + HTTP transports)
- `/be-pipeline` — Multi-stage stateful orchestration pattern (6-stage with checkpoints)
- `/be-llm-integration` — LLM provider adapter layer with streaming and fallback
- `/be-observability` — Structured logging, metrics, distributed tracing

## Trigger Keywords

"backend", "API", "endpoint", "Hono", "Express", "서버", "백엔드", "MCP", "LLM 통합", "파이프라인"

## Conventions

- TypeScript strict mode, ESM only, Node 20+
- Hono preferred for new code, Express only when legacy constraint
- Zod for all runtime validation
- pino for logging (not console.log)
- Vitest for tests (not Jest)
- User-facing messages in Korean, code/logs in English
- Error responses follow RFC 9457 Problem Details
- All new endpoints must have OpenAPI spec generated automatically
- Circuit breakers required for all external API calls

## Handoff Artifacts

Specs written to `.claude/specs/be-{feature-slug}.md`
