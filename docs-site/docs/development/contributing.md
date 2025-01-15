---
id: contributing
title: Contributing Guide
sidebar_label: Contributing
---

# Contributing to Terrarium

Thank you for your interest in contributing to Terrarium! This guide will help you get started.

## Code of Conduct

Please read and follow our [Code of Conduct](./code-of-conduct.md) to maintain a respectful and inclusive environment.

## Development Process

1. **Fork the Repository**

   - Fork the main repository
   - Clone your fork locally

2. **Create a Branch**

   - Use a descriptive branch name
   - Example: `feature/job-board-filters` or `fix/auth-error`

3. **Development Standards**

   - Follow TypeScript best practices
   - Write clean, maintainable code
   - Add proper documentation
   - Include tests

4. **Testing**

   - Run existing tests: `npm test`
   - Add new tests for your changes
   - Ensure all tests pass

5. **Documentation**

   - Update relevant documentation
   - Add inline code comments
   - Update changelog

6. **Pull Request**
   - Create a pull request from your branch
   - Fill out the PR template
   - Link related issues
   - Request review from maintainers

## Pull Request Guidelines

### PR Title Format

- `feat: add job board filters`
- `fix: resolve authentication error`
- `docs: update API documentation`
- `chore: update dependencies`

### PR Description

- Clearly describe the changes
- List any breaking changes
- Include screenshots if relevant
- Mention related issues

### Review Process

1. Automated checks must pass
2. Code review by maintainers
3. Address feedback
4. Final approval
5. Merge to main branch

## Development Setup

1. **Prerequisites**

   - Node.js 18+
   - npm 8+
   - Git

2. **Installation**

   ```bash
   git clone <your-fork>
   cd terrarium
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Configure environment variables
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

## Testing

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

## Style Guide

### TypeScript

- Use interfaces over types
- Explicit return types
- No any types
- Use proper naming conventions

### React

- Functional components
- Custom hooks for logic
- Props interface definitions
- Error boundaries

### CSS/Styling

- Use TailwindCSS utilities
- Follow BEM naming convention
- Maintain responsive design
- Follow accessibility guidelines

## Need Help?

- Check existing documentation
- Join our Discord community
- Open a GitHub issue
- Contact maintainers
