import { spawn } from 'child_process';

async function main() {
  console.log(`🎥 Starting Drizzle Studio (Development Mode)...`);
  console.log('   (Using PGLite config)');

  const args = ['studio', '--config=drizzle.config.pglite.ts'];
  
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
