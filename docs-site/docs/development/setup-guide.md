---
id: setup-guide
title: Development Setup Guide
sidebar_label: Setup Guide
---

# Development Setup Guide

This guide will help you set up your development environment for the Terrarium project.

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Git
- VS Code (recommended)
- Docker (for local Supabase)

## Step 1: Install Development Tools

### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Docker
brew install --cask docker
```

### VS Code Extensions

Install these recommended extensions:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens
- Error Lens

## Step 2: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/terrarium.git

# Navigate to project directory
cd terrarium

# Install dependencies
npm install
```

## Step 3: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Generate development keys
npm run generate-keys
```

Configure your `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your_api_key

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Authentication
AUTH_SECRET=your_auth_secret
```

## Step 4: Database Setup

```bash
# Start local Supabase
docker compose up -d

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

## Step 5: Start Development Server

```bash
# Start the development server
npm run dev

# In a separate terminal, start the API server
npm run api:dev
```

The application will be available at:

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Supabase Studio: http://localhost:54323

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- JobBoard.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### 3. Type Checking

```bash
# Run type checker
npm run type-check

# Run type checker in watch mode
npm run type-check:watch
```

### 4. Linting

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### 5. Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Common Issues and Solutions

### Database Connection Issues

```bash
# Reset database
npm run db:reset

# Rebuild containers
docker compose down
docker compose up -d
```

### Node Module Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Type Generation Issues

```bash
# Regenerate types
npm run generate-types
```

## IDE Configuration

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Git Hooks

We use Husky for Git hooks:

```bash
# Install Husky
npm run prepare

# Hooks will run automatically:
# - pre-commit: lint-staged (lint, format)
# - pre-push: type-check, tests
```

## Deployment

### Staging

```bash
# Deploy to staging
npm run deploy:staging
```

### Production

```bash
# Deploy to production
npm run deploy:prod
```

## Need Help?

- Check our [Troubleshooting Guide](./troubleshooting.md)
- Join our Discord channel
- Open a GitHub issue
- Contact the development team
