# Frontend Test Utils

This folder contains shared testing utilities for `frontend-clean`.

## Files

- `loginTestUtils.tsx`
  - `mockLoginResponse(response, status, ok)`
  - `renderLoginPage()`
  - `submitLoginForm(email, password, rememberMe)`
  - `resetAuthTestEnv({ clearStorage })`
- `routerMock.js`
  - Exports `mockPush` used by the global Next.js router mock in Jest setup.

## Conventions

- Use shared helpers instead of duplicating render/form-submit/fetch-mock logic.
- Keep login flow assertions focused on one outcome per test (redirect, error, or storage behavior).
- Reset shared mocks in `beforeEach` via `resetAuthTestEnv()`.
- Use `resetAuthTestEnv({ clearStorage: true })` for tests that assert `localStorage` or `sessionStorage`.

## Related Setup

- Global `next/navigation` mocking is configured in `jest.setup.js`.
- Frontend Jest config is in `jest.config.js`.