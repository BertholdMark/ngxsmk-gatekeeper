# Contributing to ngxsmk-gatekeeper

Thank you for your interest in contributing to ngxsmk-gatekeeper! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Security

Security vulnerabilities should be reported following our [Security Policy](./SECURITY.md). **Do not** create public GitHub issues for security vulnerabilities.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Clear and descriptive title**
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (Angular version, Node version, OS, etc.)
- **Minimal reproduction** (if possible)

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when creating a new issue.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Clear and descriptive title**
- **Detailed description** of the proposed enhancement
- **Use case** - why is this enhancement useful?
- **Possible implementation** (if you have ideas)
- **Alternatives** you've considered

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) when creating a new issue.

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding standards** (see below)
3. **Write or update tests** for your changes
4. **Update documentation** if needed
5. **Ensure all tests pass** and the build succeeds
6. **Create a clear PR description** explaining what and why

#### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md (if it exists) with your changes
3. The PR will be reviewed by maintainers
4. Once approved, your PR will be merged

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Angular CLI 17+
- Git

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/NGXSMK/ngxsmk-gatekeeper.git
   cd ngxsmk-gatekeeper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the library**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

### Project Structure

```
projects/ngxsmk-gatekeeper/
├── src/
│   ├── lib/
│   │   ├── angular/        # Angular-specific integration
│   │   ├── core/           # Framework-agnostic core
│   │   ├── helpers/        # Helper utilities
│   │   ├── middlewares/    # Built-in middleware examples
│   │   ├── presets/        # Preset middleware packs
│   │   └── providers/      # Feature flag providers
│   └── public-api.ts       # Public API exports
└── examples/                # Usage examples
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Follow Angular style guide conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Maximum line length: 100 characters
- Trailing commas in multi-line objects/arrays
- Semicolons are required

### Testing

- Write unit tests for new features
- Maintain or improve test coverage
- Tests should be clear and descriptive
- Use descriptive test names: `should do X when Y`

### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new public APIs
- Include code examples in documentation
- Update type definitions if needed

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add rate limit middleware
fix: handle null context in auth middleware
docs: update README with SSR examples
```

## Architecture Guidelines

### Core Principles

1. **Framework-agnostic core** - Core middleware engine should not depend on Angular
2. **Tree-shakeable** - All optional features should be tree-shakeable
3. **Type-safe** - Full TypeScript support with proper types
4. **Backward compatible** - Avoid breaking changes when possible
5. **Performance** - Minimal overhead, efficient execution

### Adding New Features

1. **Core features** go in `lib/core/`
2. **Angular integration** goes in `lib/angular/`
3. **Optional features** should be in separate modules (e.g., `lib/presets/`)
4. **Export via public-api.ts** for public APIs
5. **Document in README.md** for user-facing features

### Middleware Guidelines

- Middleware should be pure functions when possible
- Support sync, Promise, and Observable return types
- Use `createMiddleware` helper for named middleware
- Include error handling
- Document configuration options

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the `question` label
- Check existing issues and discussions
- Review the codebase and examples

Thank you for contributing to ngxsmk-gatekeeper! 🎉

