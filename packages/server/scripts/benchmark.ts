import autocannon from 'autocannon';
import { Table } from 'console-table-printer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface BenchmarkScenario {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
}

const scenarios: BenchmarkScenario[] = [
  {
    name: 'Kajian (Query & Pagination)',
    path: '/api/kajian?limit=50',
    method: 'GET',
  },
  {
    name: 'Display Config (Single Row Fetch)',
    path: '/api/display-config',
    method: 'GET',
  },
  {
    name: 'People (Join Query)',
    path: '/api/people',
    method: 'GET',
  },
];

async function runBenchmark(scenario: BenchmarkScenario): Promise<autocannon.Result> {
  console.log(`\n🚀 Benching: ${scenario.name}...`);
  console.log(`🔗 URL: ${BASE_URL}${scenario.path}`);

  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url: `${BASE_URL}${scenario.path}`,
        connections: 10,
        duration: 10,
        method: scenario.method,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  console.log('--- 🛡️  Masjid Display Backend Benchmark  🛡️  ---');
  console.log('--------------------------------------------------');

  const results: any[] = [];
  const LATENCY_THRESHOLD = 200; // ms

  for (const scenario of scenarios) {
    try {
      const result = await runBenchmark(scenario);
      
      const avgLatency = result.latency.average;
      const rps = result.requests.average;
      const status = avgLatency < LATENCY_THRESHOLD ? '✅ PASSED' : '❌ SLOW';

      results.push({
        Scenario: scenario.name,
        'Avg Latency (ms)': avgLatency.toFixed(2),
        'Req/Sec': rps.toFixed(2),
        Status: status,
      });
    } catch (error) {
      console.error(`Error benching ${scenario.name}:`, error);
    }
  }

  console.log('\n--- 📊 Summary Report 📊 ---');
  const p = new Table();
  p.addRows(results);
  p.printTable();

  console.log('\n--------------------------------------------------');
  console.log('💡 Note: Performance threshold is < 200ms avg latency.');
  console.log('--------------------------------------------------');
}

main().catch(console.error);
