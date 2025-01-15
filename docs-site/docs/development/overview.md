---
id: development-overview
title: Development Overview
sidebar_label: Overview
---

# Development Guide

Welcome to the Terrarium development guide. This documentation will help you understand the project structure, development workflow, and best practices.

## Project Structure

Terrarium follows a modular architecture with clear separation of concerns:

```
terrarium/
├── src/
│   ├── api/                # API client configurations
│   ├── backend/           # Backend services
│   ├── components/        # React components
│   ├── lib/              # Core utilities
│   ├── pages/            # Page components
│   ├── services/         # Service layer
│   ├── stores/           # State management
│   └── types/            # TypeScript types
├── docs/                 # Documentation
├── supabase/            # Database configuration
└── tests/               # Test files
```

## Development Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for object shapes
- Avoid using `any` type
- Use proper type annotations

### React Components

- Use functional components with hooks
- Implement proper prop typing
- Keep components focused and small
- Use error boundaries

### State Management

- Use React Query for server state
- Use Jotai for client state
- Keep state logic separated
- Handle loading states gracefully

### Testing

- Write unit tests for business logic
- Test React components
- Include error cases
- Maintain test coverage

## Development Workflow

1. Create a feature branch
2. Write tests first (TDD)
3. Implement the feature
4. Add documentation
5. Create a pull request
6. Get code review
7. Merge to main branch

## Tools and Dependencies

- **Build Tool**: Vite
- **State Management**:
  - Jotai (global state)
  - React Query (server state)
- **Forms**: React Hook Form + Zod
- **UI**: Radix UI components
- **Analytics**: Chart.js
- **Testing**: Vitest, Testing Library

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment:

   ```bash
   cp .env.example .env
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Contributing

Please read our [Contributing Guide](./contributing.md) for details on our code of conduct and the process for submitting pull requests.
