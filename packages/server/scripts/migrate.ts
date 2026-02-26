// scripts/migrate.ts
import { parseArgs } from 'util';
import path from 'path';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

const { values } = parseArgs({
  args: process.argv.slice(2).filter((arg) => arg !== '--'),
  options: {
    env: {
      type: 'string',
      default: 'development',
    }
  },
});

// npm run migrate -- --env=production
function loadEnv(env: string) {
  const envFile = env === 'development' ? '.env' : `.env.${env}`;
  const envPath = path.resolve(__dirname, '..', envFile);
  dotenv.config({ path: envPath });
  console.log(`✅ Loaded environment from ${envFile}`);
}

async function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: values.env },
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function main() {
  console.log(`🚀 Migration Manager running in [${values.env}] mode`);
  process.env.NODE_ENV = values.env;
  loadEnv(values.env!);

  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  No DATABASE_URL found. Skipping Postgres migration.");
    process.exit(0);
  }

  try {
    console.log('Applying pending migrations to the database...');
    // We run drizzle-kit migrate which will apply all pending migrations in drizzle/ folder
    await runCommand('npx', ['drizzle-kit', 'migrate', '--config=drizzle.config.ts']);
    console.log('✨ Migrations applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
