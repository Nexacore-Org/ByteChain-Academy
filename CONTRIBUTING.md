# Contributing to ByteChain Academy

Thank you for contributing to ByteChain Academy.

This guide follows the Drips Wave contribution workflow used for community-led delivery.

## Drips Wave contribution guide

1. Pick one issue and confirm scope before writing code.
2. Share a short plan (problem, approach, ETA) in the issue thread.
3. Wait for assignment or maintainer approval before starting implementation.
4. Keep the PR narrowly scoped to the assigned issue.
5. Ship with passing checks and clear documentation updates.

## Issue assignment process

1. Comment on the issue with:
  - your approach in 3-6 lines
  - expected completion time
  - any blockers/dependencies
2. A maintainer assigns the issue.
3. Start implementation only after assignment.
4. If you stop working on it, unassign yourself or notify maintainers quickly.

## Branch naming conventions

Use one of these prefixes:

- `feat/<short-description>`
- `fix/<short-description>`
- `ci/<short-description>`
- `docs/<short-description>`

Examples:

- `feat/dao-voting-history`
- `fix/auth-refresh-loop`
- `ci/add-backend-cache`
- `docs/deployment-readme`

## Development workflow

1. Fork and clone:

```bash
git clone https://github.com/<your-username>/ByteChain-Academy.git
cd ByteChain-Academy
```

2. Create a branch:

```bash
git checkout -b docs/your-change
```

3. Make changes with focused commits.

4. Run relevant checks:

```bash
# backend
cd backend
npm run lint
npm run test
npm run build

# frontend
cd ../frontend
npm run lint
npm run build
```

## PR standards

Every pull request should include:

- a clear title using conventional style (`feat:`, `fix:`, `docs:`, `ci:`)
- linked issue number (for example, `Closes #295`)
- short summary of what changed and why
- testing evidence (commands run and outcomes)
- screenshots for frontend/UI changes when relevant

PR quality requirements:

- one concern per PR
- no unrelated refactors
- no secrets in commits
- updated docs when behavior/config changes

## Commit message style

Recommended format:

- `feat: add certificate verification endpoint`
- `fix: handle missing auth token in dashboard`
- `docs: expand backend deployment guide`
- `ci: add node cache for frontend workflow`

## Code of conduct and security

- Be respectful in discussions and reviews.
- Report security issues privately to maintainers instead of opening a public issue.

Thanks for helping improve ByteChain Academy.
