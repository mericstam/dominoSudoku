# Engineering Constitution (v2025-10-20)

## 1. Code Quality
- Readable: clear names, small focused functions, minimal side effects
- Single responsibility per module/function
- Explicit over implicit; avoid hidden magic
- Prefer immutability; minimize shared mutable state
- Fail fast: validate inputs; assert invariants
- Remove duplication (rule of 3)
- Security integrated: sanitize inputs, least privilege
- Stable public interfaces; documented deprecation path
- Lint & type check clean: zero errors; no new warnings
- Traceable versioning: schemas, APIs, migrations

## 2. Testing Standards
- Pyramid: strong unit base (≥70% core logic), targeted integration, lean e2e
- Every bug requires regression test before fix merge
- Deterministic: control time, randomness, external I/O
- Contract tests for all external/service boundaries
- Benchmarks for performance‑critical paths with thresholds
- Automated accessibility checks in CI
- Flaky tests fixed ≤2 working days
- Descriptive test names: user intent or invariant
- Security tests: authN/authZ edges, injection, validation

## 3. User Experience Consistency
- Single design system; no ad‑hoc components
- Consistent terminology (maintained glossary)
- Action feedback <100ms (visual acknowledgment)
- WCAG 2.1 AA accessibility baseline
- Error messages: actionable, human, next steps
- Preserve progress in critical flows (refresh resilience)
- Responsive: 320px mobile → large desktop
- Loading: skeletons >150ms; spinners only indeterminate
- All user strings externalized (i18n ready)
- Dark/light mode parity where supported

## 4. Performance Requirements
- First interactive ≤2.5s (simulated 3G baseline)
- First meaningful paint ≤1.5s baseline device
- API P99 latency targets defined & auto‑alerted
- Bounded caches with documented eviction
- DB indexed lookups P95 <50ms; justify full scans
- Background jobs idempotent; exponential backoff retries
- Enforced bundle size budgets; increases reviewed
- Avoid N+1 queries; instrumentation detects
- Centralized rate limits; no hard‑coded magic numbers
- Observability: tracing + RED metrics on critical flows

## 5. Governance & Continuous Improvement
- ADRs for significant architectural decisions
- Weekly review: error budget, flakiness, perf regressions
- Security patch SLA: critical 24h, high 72h
- Quarterly dependency update + CVE monitoring
- Static analysis & dependency/security scans in CI
- Release checklist: rollback plan + monitoring verification
- Defined code ownership; no orphaned modules
- Postmortems (Sev1/Sev2) within 48h; actions tracked
- KPIs visible: defect escape, task success, latency, uptime

## 6. Enforcement
- CI gates: lint, types, tests, coverage, bundle, a11y, perf
- Required reviews: domain owner + QA/security for high‑risk
- Automation flags TODO >30d & dormant branches >60d

## 7. Amendment Process
1. Propose via ADR citing impacted principle
2. Domain owner review
3. Approved changes versioned; previous text archived with rationale

## 8. Definition of Done
- Principles met; CI passing
- Docs & tests updated
- Monitoring & alerts configured
- No unresolved TODOs in scope
- Rollback plan defined

End.
