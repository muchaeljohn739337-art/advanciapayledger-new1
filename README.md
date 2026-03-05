# 💰 Advancia PayLedger

Global Financial Transformation Platform

## 🚀 Quick Start

### With Docker

```bash
docker-compose up -d
```

### Local Development

```bash
# Backend
cd backend-clean
npm install
npm run dev

# Frontend
cd frontend-clean
npm install
npm run dev
```

### Access Points

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)
- Health: [http://localhost:3001/api/health](http://localhost:3001/api/health)

## 📊 Features

- ✅ Cryptocurrency payments
- ✅ Multi-blockchain support
- ✅ Healthcare management
- ✅ AI-powered security

## 🧪 CI Workflows

- Backend test gate: [.github/workflows/backend-ci.yml](.github/workflows/backend-ci.yml)
  - Runs backend type-check, tests, and build validation on pull requests and pushes to `main`/`master` when backend files change.
- Frontend test gate: [.github/workflows/frontend-ci.yml](.github/workflows/frontend-ci.yml)
  - Runs frontend tests and build validation on pull requests and pushes to `main`/`master` when frontend files change.
- CI/CD pipeline: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
  - Runs on `push` to `main`/`master` and manual dispatch; handles build/deploy jobs.

### Recommended branch protection checks

In GitHub branch protection for `main`, set these as required status checks:

- `Backend — type-check, test & build`
- `Frontend — test & build`

### Local verification

- Frontend tests: `cd frontend-clean && npm test`
- Full test run: `npm test`

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for PR checklist, local verification commands, and required CI checks.

---

## Built with ❤️ by Advancia Team
