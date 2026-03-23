# DonorConnect - Branching Strategy

This document describes the Git branching strategy used by the DonorConnect development team.

## Branch Types

### `main` - Production-Ready Code
The `main` branch contains production-ready code that is deployed to live environments.

**Rules:**
- Always stable and deployable
- Protected branch - no direct commits
- Changes only through pull requests from `develop` or `hotfix/*`
- All tests must pass before merging
- Requires code review approval

**When to merge to main:**
- After completing a sprint's features
- After thorough testing in staging
- For emergency hotfixes

---

### `develop` - Integration Branch
The `develop` branch is the integration branch where features are combined and tested together.

**Rules:**
- Contains the latest development changes
- Feature branches are merged here first
- Should be kept in a working state
- Used for integration testing

**Workflow:**
1. Feature branches merge into `develop`
2. Integration testing performed
3. When stable, `develop` merges into `main`

---

### `feature/*` - New Features
Feature branches are used for developing new functionality.

**Naming Convention:**
```
feature/<feature-name>
```

**Examples:**
- `feature/docker-ci-cd`
- `feature/donor-segmentation`
- `feature/campaign-analytics`
- `feature/workflow-automation`

**Rules:**
- Branch from `develop`
- Merge back into `develop` when complete
- Delete after merging
- Keep focused on a single feature

**Workflow:**
```bash
# Create a new feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Work on the feature
git add .
git commit -m "Add new feature"

# Push to remote
git push -u origin feature/new-feature

# Create pull request to develop
# After approval, merge and delete branch
```

---

### `hotfix/*` - Emergency Fixes
Hotfix branches are for urgent fixes to production code.

**Naming Convention:**
```
hotfix/<issue-description>
```

**Examples:**
- `hotfix/database-migration-failure`
- `hotfix/session-timeout`
- `hotfix/security-vulnerability`

**Rules:**
- Branch from `main`
- Merge into both `main` AND `develop`
- Use for critical bugs only
- Deploy immediately after merging

**Workflow:**
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix the issue
git add .
git commit -m "Fix critical bug"

# Merge into main
git checkout main
git merge hotfix/critical-bug
git push origin main

# Also merge into develop
git checkout develop
git merge hotfix/critical-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-bug
```

---

## Visual Diagram

```
main         ────●────────────────●────────────●────────
                 │                ↑            ↑
                 │                │            │
hotfix           │                │      ●─────┘ (hotfix/bug)
                 │                │
                 ↓                │
develop    ──────●────●────●──────●─────────────────────
                      ↑    ↑
                      │    │
feature               │    └── feature/campaign-analytics
                      │
                      └─────── feature/docker-ci-cd
```

## Branch Protection Rules

### For `main`:
- Require pull request reviews (1 approval minimum)
- Require status checks to pass
- Require branches to be up to date
- No force pushes
- No deletions

### For `develop`:
- Require pull request reviews
- Require status checks to pass

## Commit Message Format

Use clear, descriptive commit messages:

```
<type>: <short description>

[optional body]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: Add Docker and Docker Compose setup
fix: Resolve database connection timeout
docs: Update README with architecture diagram
```
