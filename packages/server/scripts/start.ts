import { parseArgs } from 'util';
import { spawn } from 'child_process';

// Production (Default): npm run start
// Development: npm run start -- --env=development

const { values } = parseArgs({
  args: process.argv.slice(2).filter((arg) => arg !== '--'),
  options: {
    env: {
      type: 'string',
      default: 'production',
    },
  },
});

async function main() {
  console.log(`🚀 Starting server in [${values.env}] mode...`);

  const child = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: values.env },
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });
}

main();
