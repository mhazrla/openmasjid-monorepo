import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

async function main() {
  console.log(`🎥 Starting Drizzle Studio (Development Mode)...`);
  
  // Load .env to check if DATABASE_URL exists
  dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
  
  const usePGLite = !process.env.DATABASE_URL;
  const configPath = usePGLite ? 'drizzle.config.pglite.ts' : 'drizzle.config.ts';

  if (usePGLite) {
      console.log('   (Using PGLite config)');
  } else {
      console.log('   (Using standard Postgres config)');
  }

  const args = ['studio', `--config=${configPath}`];
  
  const extraArgs = process.argv.slice(2).filter(arg => !arg.startsWith('--env'));
  args.push(...extraArgs);

  console.log(`🚀 Executing: drizzle-kit ${args.join(' ')}`);

  const child = spawn('drizzle-kit', args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }, 
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });
}

main();
