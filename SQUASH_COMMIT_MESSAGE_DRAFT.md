test(ci): harden frontend/backend coverage and split CI workflows

- add Next.js-compatible frontend Jest config and shared test helpers
- add frontend smoke/interaction/login flow tests (success, guarded, error, loading)
- fix login form label-input associations for accessibility/testability
- add dedicated frontend CI (test + build) and backend CI (type-check + test + build)
- remove PR trigger from deploy workflow; keep deploy push/manual focused
- harden CI with least-privilege permissions and job timeouts
- update docs: README CI section, CONTRIBUTING guide, session summary, PR draft

Validation:
- frontend tests passing: 9 suites / 13 tests
- backend tests passing: 6 suites / 146 tests