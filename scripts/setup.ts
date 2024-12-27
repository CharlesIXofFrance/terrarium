#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const log = {
  info: (msg: string) => console.log(chalk.blue(msg)),
  success: (msg: string) => console.log(chalk.green(msg)),
  error: (msg: string) => console.log(chalk.red(msg)),
  warning: (msg: string) => console.log(chalk.yellow(msg)),
};

async function main() {
  try {
    // 1. Check system requirements
    log.info('Checking system requirements...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    if (!nodeVersion.startsWith('v18')) {
      log.warning('Node.js v18 is recommended. You are using ' + nodeVersion);
    }

    // Check if npm is installed
    try {
      execSync('npm --version');
    } catch {
      throw new Error('npm is not installed');
    }

    // 2. Install dependencies
    log.info('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // 3. Set up environment variables
    log.info('Setting up environment variables...');
    if (!fs.existsSync('.env.local')) {
      fs.copyFileSync('.env.example', '.env.local');
      log.success('Created .env.local from .env.example');
      log.warning('Please update .env.local with your credentials');
    }

    // 4. Check Supabase CLI
    log.info('Checking Supabase CLI...');
    try {
      execSync('supabase --version');
    } catch {
      log.warning('Supabase CLI not found. Installing...');
      execSync('brew install supabase/tap/supabase', { stdio: 'inherit' });
    }

    // 5. Start local Supabase
    log.info('Starting local Supabase...');
    execSync('npx supabase start', { stdio: 'inherit' });

    // 6. Run database migrations
    log.info('Running database migrations...');
    execSync('npx supabase db push', { stdio: 'inherit' });

    // 7. Type check
    log.info('Running type check...');
    execSync('npm run type-check', { stdio: 'inherit' });

    // 8. Run tests
    log.info('Running tests...');
    execSync('npm test', { stdio: 'inherit' });

    log.success('Setup complete! 🎉');
    log.info('\nNext steps:');
    log.info('1. Update .env.local with your credentials');
    log.info('2. Run npm run dev to start the development server');
    log.info('3. Visit http://localhost:5173 in your browser');

  } catch (error) {
    log.error('Setup failed!');
    if (error instanceof Error) {
      log.error(error.message);
    }
    process.exit(1);
  }
}

main();
