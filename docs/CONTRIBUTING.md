# Contributing to Acadivo

Thank you for your interest in contributing to Acadivo! This document provides guidelines for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Workflow](#development-workflow)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Template](#pull-request-template)
- [Code Style Guide](#code-style-guide)
- [Testing Requirements](#testing-requirements)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Standards

We are committed to providing a friendly, safe, and welcoming environment for all contributors.

- Be respectful and inclusive in all interactions
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept responsibility and apologize when mistakes are made
- Prioritize the community's best interests

### Unacceptable Behavior

- Harassment, discrimination, or intimidation of any kind
- Trolling, insulting/derogatory comments, or personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct that could reasonably be considered inappropriate

### Enforcement

Violations of the code of conduct may result in temporary or permanent bans from project participation.

---

## Development Workflow

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment** (see [SETUP.md](./SETUP.md))
4. **Create a branch** for your feature or fix
5. **Make your changes** following the style guide
6. **Write tests** for new functionality
7. **Run the test suite** to ensure nothing breaks
8. **Commit** using conventional commit messages
9. **Push** to your fork
10. **Open a Pull Request** using the template

### Keeping Your Fork Updated

```bash
# Add upstream remote
git remote add upstream https://github.com/acadivo/acadivo.git

# Fetch upstream changes
git fetch upstream

# Rebase your branch
git checkout feature/your-feature
git rebase upstream/main
```

---

## Branch Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New feature or enhancement | `feature/attendance-export` |
| `fix/` | Bug fix | `fix/login-redirect` |
| `docs/` | Documentation changes | `docs/api-examples` |
| `refactor/` | Code refactoring | `refactor/user-service` |
| `test/` | Test-related changes | `test/fee-coverage` |
| `chore/` | Maintenance tasks | `chore/update-deps` |
| `perf/` | Performance improvements | `perf/query-optimization` |
| `security/` | Security fixes | `security/sql-injection-fix` |

### Rules
- Use lowercase letters and hyphens only
- Keep names descriptive but concise (max 50 characters)
- Include issue number if applicable: `feature/123-attendance-export`

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependencies, tooling |
| `ci` | CI/CD changes |
| `revert` | Revert previous commit |

### Scopes

| Scope | Description |
|-------|-------------|
| `api` | REST API server |
| `web` | Next.js web application |
| `mobile` | Flutter mobile app |
| `socket` | Socket.io server |
| `db` | Database schema or migrations |
| `auth` | Authentication/authorization |
| `fee` | Fee management module |
| `attendance` | Attendance module |
| `homework` | Homework module |
| `result` | Results/marks module |
| `comm` | Communication (messages, announcements) |
| `shared` | Shared packages |

### Examples

```
feat(api): add fee payment webhook endpoint

Implement JazzCash and EasyPaisa payment callbacks
with signature verification and idempotency checks.

Closes #234
```

```
fix(web): resolve attendance chart crash on empty data

The chart component was failing when no attendance
records existed for the selected date range.
```

```
docs: add Urdu language FAQ to user guides

Added comprehensive FAQ section in Urdu for all
six user roles based on feedback from pilot schools.
```

---

## Pull Request Template

When opening a PR, use this template:

```markdown
## Description

Brief description of what this PR does.

Fixes # (issue number)

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## How Has This Been Tested?

Please describe the tests that you ran:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

Describe your test setup:
- OS:
- Browser (for web changes):
- Device (for mobile changes):

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### PR Rules

1. **One concern per PR** — Don't mix unrelated changes
2. **Keep PRs small** — Ideally under 400 lines of code
3. **Link to issues** — Reference related issue numbers
4. **Update docs** — If behavior changes, update relevant docs
5. **Add tests** — Every bug fix and feature needs tests
6. **Pass CI** — All checks must be green before merge

---

## Code Style Guide

### TypeScript / JavaScript

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **semicolons** at the end of statements
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes, interfaces, and types
- Use **UPPER_SNAKE_CASE** for constants
- Maximum line length: **100 characters**
- Always use **strict TypeScript** (`strict: true`)

### Example

```typescript
// Good
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  isActive: boolean;
}

const MAX_LOGIN_ATTEMPTS = 5;

function calculateAttendancePercentage(
  present: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

// Bad
interface userprofile {
  ID: string
  firstname: string
  lastname: string
  date_of_birth: Date
  is_active: boolean
}

const maxLoginAttempts = 5

function calc_attendance(present, total) {
  return (present/total)*100
}
```

### React / Next.js

- Use **functional components** with hooks
- Use **named exports** for components
- Place **hooks at the top** of the component
- Use **Early returns** for conditional rendering
- Use **descriptive event handler names**: `handleClick`, `handleSubmit`

### Flutter / Dart

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **lowerCamelCase** for variables and functions
- Use **UpperCamelCase** for classes
- Use **snake_case** for file names
- Add **trailing commas** for better formatting

### Example

```dart
// Good
class AttendanceService {
  final ApiService apiService;
  
  AttendanceService({required this.apiService});
  
  Future<List<Attendance>> getAttendance({
    required String classId,
    required String sectionId,
    required DateTime date,
  }) async {
    // ...
  }
}

// Bad
class attendance_service {
  final ApiService api_service;
  
  attendance_service({required this.api_service});
  
  Future<List<Attendance>> GetAttendance(String classId, String sectionId, DateTime date) async {
    // ...
  }
}
```

---

## Testing Requirements

### Minimum Coverage

| Package | Minimum Coverage |
|---------|-----------------|
| `packages/api` | 70% |
| `packages/shared` | 80% |
| `apps/web` | 60% |

### Running Tests

```bash
# Run all tests
pnpm test

# Run API tests
cd packages/api && pnpm test

# Run web tests
cd apps/web && pnpm test

# Run with coverage
pnpm test:coverage
```

### Test Structure

```
packages/api/
  src/
    services/
      fee.service.ts
  tests/
    unit/
      fee.service.test.ts
    integration/
      fee.routes.test.ts
    fixtures/
      fee.fixture.ts
```

### Writing Tests

Use the **AAA pattern**:

```typescript
// Arrange
const feeStructure = createFeeStructureFixture();

// Act
const result = await feeService.calculateTotal(feeStructure);

// Assert
expect(result).toBe(5000);
```

---

## Issue Reporting

### Before Creating an Issue

1. Search existing issues to avoid duplicates
2. Check if the issue is reproducible on the latest version
3. Gather relevant information (screenshots, logs, steps to reproduce)

### Issue Template

```markdown
## Bug Report / Feature Request

### Description
A clear description of the bug or feature.

### Steps to Reproduce (for bugs)
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

### Expected Behavior
What you expected to happen.

### Actual Behavior
What actually happened.

### Screenshots
If applicable, add screenshots.

### Environment
- OS: [e.g. Ubuntu 22.04, Windows 11, macOS 14]
- Browser: [e.g. Chrome 120, Safari 17]
- Node Version: [e.g. 20.10.0]
- Acadivo Version: [e.g. 1.0.0]

### Additional Context
Any other context about the problem.
```

### Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Documentation improvement |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `priority:high` | Urgent issue |
| `priority:low` | Can be addressed later |
| `api` | Related to REST API |
| `web` | Related to web app |
| `mobile` | Related to mobile app |

---

Thank you for contributing to Acadivo! Your efforts help improve education technology for Pakistani schools.

*For setup instructions, see [SETUP.md](./SETUP.md).*
*For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).*
