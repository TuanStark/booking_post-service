#!/usr/bin/env node

const { execSync } = require('child_process');

const MAX_RETRIES = 30;
const RETRY_DELAY = 2000; // 2 seconds

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runMigrations() {
  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      console.log('Running Prisma migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully');
      process.exit(0);
    } catch (error) {
      retries--;
      if (retries <= 0) {
        console.error('❌ Failed to run migrations after', MAX_RETRIES, 'retries');
        console.error('Error:', error.message);
        process.exit(1);
      }
      console.log(
        `⚠️  Migration failed, retrying in ${RETRY_DELAY / 1000}s... (${retries} retries left)`
      );
      await wait(RETRY_DELAY);
    }
  }
}

runMigrations();

