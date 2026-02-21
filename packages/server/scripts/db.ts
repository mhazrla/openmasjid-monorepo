import { parseArgs } from 'util';
import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv'; // Import as module, do not auto-exec

// Reset & Seed All: npm run db -- --refresh --seed=all
// Seed Users Only (Prod): npm run db -- --env=production --seed=user
// Push Schema Only: npm run db -- --push
const { values } = parseArgs({
  args: process.argv.slice(2).filter((arg) => arg !== '--'),
  options: {
    env: {
      type: 'string',
      default: 'development',
    },
    refresh: {
      type: 'boolean',
      default: false,
    },
    push: {
      type: 'boolean',
      default: false,
    },
    seed: {
      type: 'string',
    },
  },
});

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

function loadEnv(env: string) {
  const envFile = env === 'development' ? '.env' : `.env.${env}`;
  const envPath = path.resolve(__dirname, '..', envFile);
  
  // Try loading specific env file first
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    if (env !== 'development') {
       console.warn(`⚠️  Could not load ${envFile}, falling back to .env`);
       dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
    } else {
       // If dev .env missing, maybe intentional, but good to warn
       console.warn(`⚠️  Could not load .env at ${envPath}`);
    }
  } else {
    console.log(`✅ Loaded environment from ${envFile}`);
  }
}

async function main() {
  console.log(`🔧 DB Manager running in [${values.env}] mode`);

  // 1. Set NODE_ENV
  process.env.NODE_ENV = values.env;

  // 2. Load Environment Variables MANUALLY
  loadEnv(values.env);

  try {
    // Dynamic imports to ensure config is loaded with the correct NODE_ENV
    const { fresh } = await import('../src/db/fresh');
    // Note: WE DO NOT IMPORT seed HERE yet because it initializes the DB connection
    // and might lock the file, preventing fresh() from deleting .pgdata

    // 1. Fresh (Reset DB)
    if (values.refresh) {
      await fresh();
    }

    // 2. Push Schema (Drizzle Kit) or Migrate (Test/Memory)
    if (values.push || values.refresh) {
      if (values.env === 'test') {
          console.log('🚀 Running in-process migrations for Test (Memory) environment...');
          // Test env uses memory://, so we must migrate the SAME db instance in-process
          const { runPGLiteMigrations } = await import('../src/db/migrate-pglite');
          await runPGLiteMigrations();
      } else {
          console.log('🚀 Pushing schema changes...');
          
          const isPGLite = values.env === 'development' && !process.env.DATABASE_URL;
          const args = ['push', '--force'];
          
          if (isPGLite) {
              args.push('--config=drizzle.config.pglite.ts');
              console.log('   (Using PGLite config)');
          } else {
              args.push('--config=drizzle.config.ts');
              console.log('   (Using standard Postgres config)');
          }

          await runCommand('drizzle-kit', args);
      }
    }

    // 3. Seed Data
    if (values.seed || values.refresh) {
      const seedType = values.seed || 'all'; 
      
      // Check if it's a valid seed type
      const validTypes = ['all', 'user', 'master', 'content'];
      if (!validTypes.includes(seedType)) {
          console.warn(`⚠️  Warning: Unknown seed type '${seedType}'. Defaulting to 'all' logic (or skipping specific blocks).`);
      }

      // Lazy load seed (and DB connection) ONLY after fresh/push are done
      console.log('⏳ Initializing DB connection for seeding...');
      const { seed } = await import('../src/db/seed');

      await seed({ type: seedType as any });
    }

    console.log('✨ All operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  }
}

main();
