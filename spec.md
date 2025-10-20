# Project Specification (v2025-10-20)

## 1. Code Quality Principles
- Readable: clear names, small focused functions, minimal side effects
- Single responsibility per module/function
- Explicit over implicit; avoid hidden magic/config
- Prefer immutability; minimize shared mutable state
- Fail fast: validate inputs at boundaries, assert internal invariants
- Remove duplication (rule of 3) early
- Security integrated: sanitize inputs, least privilege defaults
- Stable public interfaces; deprecate with documented migration path
- Lint & type check clean: zero errors, no new warnings introduced
- Traceable versioning for schemas, APIs, migrations

## 2. Testing Standards
- Test pyramid: strong unit base (≥70% coverage on core logic), targeted integration, lean e2e
- Every bug requires a regression test before fix commit merges
- Deterministic tests: control time, randomness, external I/O (mock/stub)
- Contract tests for all external/service boundaries
- Benchmarks for performance‐critical paths with enforced thresholds
- Automated accessibility (a11y) checks in CI
- Flaky tests fixed within 2 working days; track flakiness metric
- Descriptive test names express user intent or invariant (not implementation detail)
- Security tests: authN/authZ edge cases & injection/input validation

## 3. User Experience Consistency
- Single design system source of truth; no ad‑hoc components
- Consistent terminology backed by maintained glossary
- Action feedback <100ms (visual acknowledgment)
- WCAG 2.1 AA: full keyboard navigation & semantic structure
- Error messages: actionable, human, next-step guidance
- Preserve progress in critical flows (refresh resilience)
- Responsive from 320px mobile to large desktop
- Loading states: skeletons for content >150ms; spinners only for indeterminate waits
- All user strings externalized (i18n ready); avoid concatenation
- Dark/light mode parity where supported

## 4. Performance Requirements
- First interactive ≤2.5s on simulated 3G baseline device
- First meaningful paint ≤1.5s baseline target
- API P99 latency targets defined + automatic alerting
- Bounded caches; documented eviction strategies (no unbounded growth)
- DB indexed lookups P95 <50ms; justify full scans explicitly
- Background jobs idempotent with exponential backoff retries
- Enforced bundle size budgets; increases require review
- Avoid N+1 queries; instrumentation detects & reports
- Centralized rate limits; no hard‑coded magic numbers
- Observability baseline: tracing + RED (Rate, Errors, Duration) metrics for critical flows

## 5. Governance & Continuous Improvement
- ADR required for significant architectural decisions
- Weekly review: error budget, test flakiness, perf regressions
- Critical security patches within 24h; high severity within 72h
- Quarterly dependency update cycle + CVE monitoring
- Static analysis & dependency/security scans integrated in CI
- Release checklist: rollback plan, monitoring & alert verification
- Defined code ownership; no orphaned modules
- Postmortems for Sev1/Sev2 within 48h; action items tracked
- KPIs visible: defect escape rate, task success rate, latency, uptime

## 6. Enforcement Mechanisms
- CI gates: lint, types, tests, coverage threshold, bundle/a11y/perf checks
- Required reviews: domain owner + QA/security for high-risk changes
- Automation flags: TODO >30 days, dormant branches >60 days

## 7. Amendment Process
1. Proposal via ADR citing impacted principles
2. Review by domain owners
3. Approved changes versioned; previous text archived with rationale

## 8. Definition of Done (DoD)
- All principles met
- CI gates passing
- Documentation & tests updated
- Monitoring & alerts configured
- No unresolved TODOs in changed scope
- Rollback plan defined

End of specification.
