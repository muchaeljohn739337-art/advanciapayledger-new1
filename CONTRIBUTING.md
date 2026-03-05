# Contributing

## Branching and PRs

- Create feature branches from `main`.
- Keep PRs focused and small when possible.
- Link related issue/task context in the PR description.

## Required CI checks

For merges to `main`, these checks should pass:

- `Backend — type-check, test & build`
- `Frontend — test & build`

## Local verification before opening PR

From repository root:

```bash
# Full test run
npm test
```

Frontend only:

```bash
cd frontend-clean
npm test
npm run build
```

Backend only:

```bash
cd backend-clean
npm test
npx tsc --noEmit
npm run build
```

## PR checklist

- [ ] Changes are scoped to the request
- [ ] Tests updated/added for behavior changes
- [ ] Local checks pass
- [ ] CI checks pass
- [ ] Docs updated if behavior or workflow changed

## Notes

- CI workflows are defined in `.github/workflows/`.
- Frontend test helpers and conventions are documented in `frontend-clean/test-utils/README.md`.