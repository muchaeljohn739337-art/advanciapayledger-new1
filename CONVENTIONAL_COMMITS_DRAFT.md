# Conventional Commits Draft (Non-Squash Option)

Use this if you want to split the work into multiple focused commits instead of one squash commit.

## 1) Frontend test foundation

`test(frontend): set up Next.js Jest config and shared test utilities`

- add `frontend-clean/jest.config.js`
- add `frontend-clean/jest.setup.js`
- add `frontend-clean/test-utils/loginTestUtils.tsx`
- add `frontend-clean/test-utils/routerMock.js`
- add `frontend-clean/test-utils/README.md`

## 2) Frontend login/page coverage

`test(frontend): add smoke, interaction, and login flow coverage`

- add component/page smoke tests
- add FAQ interaction test
- add login success/guarded/error/loading tests

## 3) Frontend accessibility fix

`fix(frontend): associate login labels with inputs for accessibility`

- update `frontend-clean/src/app/login/page.tsx`
- add `htmlFor`/`id` for email and password fields

## 4) CI split and hardening

`ci(workflows): split test gates from deploy and harden CI jobs`

- add `.github/workflows/frontend-ci.yml` (test + build)
- add `.github/workflows/backend-ci.yml` (type-check + test + build)
- update `.github/workflows/deploy.yml` (push/manual focused)
- add least-privilege `permissions` and job timeouts

## 5) Documentation updates

`docs(repo): document CI workflows, contribution process, and session summary`

- update `README.md` CI/contributing sections
- add `CONTRIBUTING.md`
- add `SESSION_SUMMARY.md`
- add PR/commit drafting docs (`PR_DESCRIPTION_DRAFT.md`, `SQUASH_COMMIT_MESSAGE_DRAFT.md`)