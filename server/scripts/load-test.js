'use strict';
const autocannon = require('autocannon');

const BASE_URL = process.argv[2] || 'http://localhost:5000';
const DURATION = parseInt(process.argv[3]) || 30; // seconds
const CONNECTIONS = parseInt(process.argv[4]) || 100;

console.log(`\n🔥 Load Test — AECC Platform`);
console.log(`   Target: ${BASE_URL}`);
console.log(`   Duration: ${DURATION}s | Connections: ${CONNECTIONS}\n`);

const scenarios = [
  { name: 'Homepage (static)', path: '/' },
  { name: 'API Health', path: '/api/system/health' },
  { name: 'API Stats', path: '/api/system/stats' },
  { name: 'API Blogs', path: '/api/blogs?limit=10' },
  { name: 'API Events', path: '/api/events?limit=10' },
  { name: 'API FAQ', path: '/api/faq' },
  { name: 'API Learning Channels', path: '/api/learning/channels' },
];

async function runScenario(scenario) {
  return new Promise((resolve) => {
    const instance = autocannon({
      url: `${BASE_URL}${scenario.path}`,
      connections: CONNECTIONS,
      duration: DURATION,
      pipelining: 1,
      timeout: 10,
    }, (err, result) => {
      if (err) {
        console.error(`  ❌ ${scenario.name}: ${err.message}`);
        resolve(null);
        return;
      }
      resolve({
        name: scenario.name,
        path: scenario.path,
        requests: result.requests.average,
        latency: result.latency.average,
        latencyP99: result.latency.p99,
        throughput: (result.throughput.average / 1024 / 1024).toFixed(2),
        errors: result.errors,
        timeouts: result.timeouts,
        '2xx': result['2xx'],
        non2xx: result.non2xx,
      });
    });
    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  const results = [];

  for (const scenario of scenarios) {
    console.log(`\n📊 Testing: ${scenario.name} (${scenario.path})`);
    const result = await runScenario(scenario);
    if (result) results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📋 LOAD TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Target: ${BASE_URL} | ${CONNECTIONS} connections | ${DURATION}s/scenario\n`);

  console.log(
    'Endpoint'.padEnd(30) +
    'Req/s'.padStart(8) +
    'Latency'.padStart(10) +
    'P99'.padStart(8) +
    'MB/s'.padStart(8) +
    'Errors'.padStart(8) +
    '2xx'.padStart(10)
  );
  console.log('-'.repeat(82));

  for (const r of results) {
    console.log(
      r.name.padEnd(30) +
      String(Math.round(r.requests)).padStart(8) +
      `${r.latency.toFixed(1)}ms`.padStart(10) +
      `${r.latencyP99.toFixed(0)}ms`.padStart(8) +
      r.throughput.padStart(8) +
      String(r.errors + r.timeouts).padStart(8) +
      String(r['2xx']).padStart(10)
    );
  }

  console.log('-'.repeat(82));

  const avgLatency = results.reduce((s, r) => s + r.latency, 0) / results.length;
  const totalErrors = results.reduce((s, r) => s + r.errors + r.timeouts, 0);

  console.log(`\n✅ Average latency: ${avgLatency.toFixed(1)}ms`);
  console.log(`${totalErrors === 0 ? '✅' : '⚠️'}  Total errors: ${totalErrors}`);

  if (avgLatency < 50) {
    console.log('\n🟢 PASS — Average latency < 50ms. Ready for 2000+ users.');
  } else if (avgLatency < 200) {
    console.log('\n🟡 ACCEPTABLE — Average latency < 200ms. Adequate for production.');
  } else {
    console.log('\n🔴 NEEDS OPTIMIZATION — Average latency > 200ms.');
  }
}

main().catch(console.error);
