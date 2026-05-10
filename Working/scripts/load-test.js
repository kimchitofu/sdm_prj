#!/usr/bin/env node
/**
 * FundBridge DB Load Test Script
 *
 * Usage:
 *   node --env-file=.env ./scripts/load-test.js [options]
 *
 * Options:
 *   --url <url>        Base URL of the running Next.js app  (default: http://localhost:3000)
 *   --scenario <name>  all | register | login | browse | campaigns | donations | mixed
 *   --users <n>        Override concurrent user count for register/login/browse
 *   --no-cleanup       Skip deleting test data from the DB after the run
 *   --log-dir <dir>    Directory for the log file  (default: project root)
 *
 * Terminal  — one line per scenario: OK / FAIL + brief stats
 * Log file  — full JSON report: DB info, schema, per-scenario stats, percentiles
 */

'use strict';

const { PrismaClient } = require('@prisma/client');
const fs   = require('fs');
const path = require('path');

// ─── CLI args ─────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function arg(flag, fallback) {
  const i = argv.indexOf(flag);
  return i !== -1 ? argv[i + 1] : fallback;
}
const BASE_URL   = arg('--url',      'http://localhost:3000');
const SCENARIO   = arg('--scenario', 'all');
const USER_COUNT = arg('--users',    null);
const NO_CLEANUP = argv.includes('--no-cleanup');
const LOG_DIR    = arg('--log-dir',  path.join(__dirname, '..'));

// ─── Configuration ────────────────────────────────────────────────────────────
const CFG = {
  register:  { users: parseInt(USER_COUNT) || 1000, batchSize: 40 },
  login:     { users: parseInt(USER_COUNT) || 100,  batchSize: 40 },
  browse:    { users: parseInt(USER_COUNT) || 500,  batchSize: 80 },
  campaigns: { count: 10 },
  donations: { count: 100, batchSize: 25 },
  mixed:     { users: 100, batchSize: 25 },
};

const TEST_PREFIX   = `lt_${Date.now()}`;
const TEST_PASSWORD = 'LoadTest@1234';
const RUN_ID        = `run_${Date.now()}`;

// ─── Log file ─────────────────────────────────────────────────────────────────
const ts       = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_PATH = path.join(LOG_DIR, `load-test-${ts}.log`);
const logDoc   = {
  runId:      RUN_ID,
  startedAt:  new Date().toISOString(),
  finishedAt: null,
  config:     { baseUrl: BASE_URL, scenario: SCENARIO, noCleanup: NO_CLEANUP, testPrefix: TEST_PREFIX },
  database: {
    type: 'MySQL 8.0',
    host: 'localhost',
    port: 3306,
    name: 'fundbridge',
    orm:  'Prisma 5.22.0',
    url:  (process.env.DATABASE_URL || '').replace(/:[^:@]+@/, ':***@'),
  },
  schema: {
    models:         ['User','Campaign','Donation','Category','Favourite','CampaignUpdate',
                     'CampaignReport','AuditLog','EmailTemplate','EmailLog','Announcement','EmailAutomationRule'],
    userRoles:      ['donor','fund_raiser','donee','admin','campaign_admin','platform_manager'],
    campaignStatus: ['draft','active','completed','suspended','cancelled'],
    donationStatus: ['completed','pending','refunded','failed'],
  },
  scenarios: [],
  summary:   null,
};

function writeLog() {
  logDoc.finishedAt = new Date().toISOString();
  fs.writeFileSync(LOG_PATH, JSON.stringify(logDoc, null, 2), 'utf8');
}

// ─── Colors — only used for OK / FAIL badges and final PASS / FAIL ────────────
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const RESET  = '\x1b[0m';
const ok     = s => `${GREEN}${s}${RESET}`;
const fail   = s => `${RED}${s}${RESET}`;

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function httpReq(method, endpoint, body, extraHeaders = {}) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: body ? JSON.stringify(body) : undefined,
    });
    const latency = Date.now() - t0;
    const text    = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    const cookie = res.headers.get('set-cookie') || '';
    const token  = (cookie.match(/auth-token=([^;]+)/) || [])[1] || null;
    return { status: res.status, latency, data, token };
  } catch (e) {
    return { status: 0, latency: Date.now() - t0, error: e.message };
  }
}

// ─── Batch runner ─────────────────────────────────────────────────────────────
async function runBatches(tasks, batchSize) {
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    results.push(...await Promise.all(tasks.slice(i, i + batchSize).map(fn => fn())));
    if (i + batchSize < tasks.length) await new Promise(r => setTimeout(r, 80));
  }
  return results;
}

// ─── Statistics ───────────────────────────────────────────────────────────────
function calcStats(results) {
  const success = results.filter(r => r.status >= 200 && r.status < 300).length;
  const total   = results.length;
  const lats    = results.map(r => r.latency).filter(n => n > 0).sort((a, b) => a - b);
  const p       = pct => lats[Math.min(lats.length - 1, Math.floor(lats.length * pct))] ?? 0;
  const avg     = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0;
  return {
    total,
    success,
    errors: total - success,
    successRate: total ? parseFloat(((success / total) * 100).toFixed(1)) : 0,
    latencyStats: { min: lats[0] ?? 0, max: lats[lats.length - 1] ?? 0, avg, p50: p(0.5), p95: p(0.95), p99: p(0.99) },
  };
}

// ─── Terminal line printer ─────────────────────────────────────────────────────
// Prints a fixed result line: [idx/total]  Name            detail    BADGE  stats
function printResult(idx, total, name, detail, passed, extra) {
  const tag    = `[${idx}/${total}]`.padEnd(7);
  const nm     = name.padEnd(30);
  const dt     = detail.padEnd(15);
  const badge  = passed ? ok(' OK ') : fail('FAIL');
  console.log(`  ${tag}  ${nm}  ${dt}  ${badge}  ${extra}`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENARIO 1 — User Registration Flood
// ─────────────────────────────────────────────────────────────────────────────
async function scenarioRegister(idx, total) {
  const cfg = CFG.register;

  const tasks = Array.from({ length: cfg.users }, (_, i) => async () => {
    const email = `${TEST_PREFIX}_u${String(i).padStart(5, '0')}@loadtest.local`;
    return { ...await httpReq('POST', '/api/auth/register', {
      email, password: TEST_PASSWORD, firstName: 'LT', lastName: `User${i}`, role: 'donor',
    }), email };
  });

  const t0      = Date.now();
  const results = await runBatches(tasks, cfg.batchSize);
  const elapsed = Date.now() - t0;
  const stats   = calcStats(results);

  printResult(idx, total, 'User Registration Flood', `${cfg.users} users`, stats.successRate >= 95,
    `${stats.success}/${stats.total}  ${stats.successRate}%  avg ${stats.latencyStats.avg}ms  p95 ${stats.latencyStats.p95}ms`);

  logDoc.scenarios.push({
    name: 'User Registration Flood', endpoint: 'POST /api/auth/register',
    dbTable: 'User', dbOperation: 'INSERT + bcrypt hash (cost 10)',
    concurrency: cfg.users, batchSize: cfg.batchSize,
    wallClockMs: elapsed, throughputRps: parseFloat((cfg.users / (elapsed / 1000)).toFixed(2)),
    ...stats,
  });
  writeLog();

  return results.filter(r => r.status === 201).map(r => r.email);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENARIO 2 — Login Storm
// ─────────────────────────────────────────────────────────────────────────────
async function scenarioLogin(idx, total, registeredEmails) {
  const cfg    = CFG.login;
  const sample = registeredEmails.slice(0, cfg.users);

  const tasks = sample.map(email => async () => ({
    ...await httpReq('POST', '/api/auth/login', { email, password: TEST_PASSWORD }), email,
  }));

  const t0      = Date.now();
  const results = await runBatches(tasks, cfg.batchSize);
  const elapsed = Date.now() - t0;
  const stats   = calcStats(results);
  const tokens  = results.filter(r => r.status === 200 && r.token).map(r => r.token);

  printResult(idx, total, 'Login Storm', `${sample.length} users`, stats.successRate >= 95,
    `${stats.success}/${stats.total}  ${stats.successRate}%  avg ${stats.latencyStats.avg}ms  p95 ${stats.latencyStats.p95}ms`);

  logDoc.scenarios.push({
    name: 'Login Storm', endpoint: 'POST /api/auth/login',
    dbTable: 'User', dbOperation: 'SELECT findUnique + bcrypt.compare + UPDATE lastLoginAt',
    concurrency: sample.length, batchSize: cfg.batchSize,
    wallClockMs: elapsed, throughputRps: parseFloat((sample.length / (elapsed / 1000)).toFixed(2)),
    tokensObtained: tokens.length, ...stats,
  });
  writeLog();

  return tokens;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENARIO 3 — Campaign Browse Under Load
// ─────────────────────────────────────────────────────────────────────────────
async function scenarioBrowse(idx, total) {
  const cfg = CFG.browse;

  const tasks = Array.from({ length: cfg.users }, () => () => httpReq('GET', '/api/campaigns'));

  const t0      = Date.now();
  const results = await runBatches(tasks, cfg.batchSize);
  const elapsed = Date.now() - t0;
  const stats   = calcStats(results);

  const counts      = results.filter(r => r.data?.campaigns).map(r => r.data.campaigns.length);
  const avgReturned = counts.length ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) : 0;

  printResult(idx, total, 'Campaign Browse Under Load', `${cfg.users} readers`, stats.successRate >= 99,
    `${stats.success}/${stats.total}  ${stats.successRate}%  avg ${stats.latencyStats.avg}ms  p95 ${stats.latencyStats.p95}ms`);

  logDoc.scenarios.push({
    name: 'Campaign Browse Under Load', endpoint: 'GET /api/campaigns',
    dbTable: 'Campaign + User (JOIN)', dbOperation: 'SELECT with status filter + include organiser',
    concurrency: cfg.users, batchSize: cfg.batchSize,
    wallClockMs: elapsed, throughputRps: parseFloat((cfg.users / (elapsed / 1000)).toFixed(2)),
    avgCampaignsReturned: avgReturned, ...stats,
  });
  writeLog();
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENARIO 4 — Campaign Creation Burst
// ─────────────────────────────────────────────────────────────────────────────
async function scenarioCampaignCreation(idx, total, prisma) {
  const cfg    = CFG.campaigns;
  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash(TEST_PASSWORD, 10);

  const frUsers = [];
  for (let i = 0; i < cfg.count; i++) {
    const email = `${TEST_PREFIX}_fr${i}@loadtest.local`;
    const user  = await prisma.user.upsert({
      where: { email }, update: {},
      create: { email, password: hashed, firstName: 'LT-FR', lastName: `FR${i}`, role: 'fund_raiser' },
      select: { id: true, email: true },
    });
    frUsers.push(user);
  }

  const frTokens = [];
  for (const u of frUsers) {
    const r = await httpReq('POST', '/api/auth/login', { email: u.email, password: TEST_PASSWORD });
    if (r.token) frTokens.push({ userId: u.id, token: r.token });
  }

  if (!frTokens.length) {
    printResult(idx, total, 'Campaign Creation Burst', `${cfg.count} campaigns`, false, 'no auth tokens obtained');
    return [];
  }

  const categories = ['Education','Medical','Environment','Arts','Community',
                      'Disaster Relief','Animal Welfare','Technology','Sports','Other'];
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const tasks = frTokens.map((fr, i) => async () =>
    httpReq('POST', '/api/fund-raiser/campaigns', {
      title:                   `${TEST_PREFIX} Campaign ${i + 1}`,
      summary:                 `Load test campaign ${i + 1}`,
      description:             `Scenario 4 - concurrent campaign creation, batch ${cfg.count}`,
      category:                categories[i % categories.length],
      serviceType:             'General',
      targetAmount:            1000 + i * 500,
      startDate:               now.toISOString().split('T')[0],
      endDate:                 end.toISOString().split('T')[0],
      beneficiaryName:         `Beneficiary ${i}`,
      beneficiaryRelationship: 'Self',
      location:                'Singapore',
      coverImage:              `https://placeholder.test/cover-${i}.jpg`,
      isDraft:                 false,
    }, { Cookie: `auth-token=${fr.token}` })
  );

  const t0      = Date.now();
  const results = await Promise.all(tasks.map(fn => fn()));
  const elapsed = Date.now() - t0;
  const stats   = calcStats(results);
  const created = results.filter(r => r.status === 200 && r.data?.campaignId).length;

  printResult(idx, total, 'Campaign Creation Burst', `${cfg.count} campaigns`, stats.successRate >= 90,
    `${created}/${cfg.count} created  ${stats.successRate}%  avg ${stats.latencyStats.avg}ms  p95 ${stats.latencyStats.p95}ms`);

  logDoc.scenarios.push({
    name: 'Campaign Creation Burst', endpoint: 'POST /api/fund-raiser/campaigns',
    dbTable: 'Campaign', dbOperation: 'INSERT (authenticated, role=fund_raiser)',
    concurrency: cfg.count, batchSize: cfg.count,
    wallClockMs: elapsed, throughputRps: parseFloat((cfg.count / (elapsed / 1000)).toFixed(2)),
    campaignsCreated: created, ...stats,
  });
  writeLog();

  return frUsers.map(u => u.id);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENARIO 5 — Donation Flood
// ─────────────────────────────────────────────────────────────────────────────
async function scenarioDonations(idx, total, prisma) {
  const cfg = CFG.donations;

  let organiser = await prisma.user.findFirst({ where: { role: 'fund_raiser' } });
  if (!organiser) {
    const bcrypt = require('bcryptjs');
    organiser = await prisma.user.create({
      data: {
        email: `${TEST_PREFIX}_org@loadtest.local`,
        password: await bcrypt.hash(TEST_PASSWORD, 10),
        firstName: 'LT', lastName: 'Organiser', role: 'fund_raiser',
      },
    });
  }

  const now      = new Date();
  const end      = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const campaign = await prisma.campaign.create({
    data: {
      title: `${TEST_PREFIX} Donation Flood Campaign`, summary: 'Load test target campaign',
      description: 'Scenario 5 - concurrent donation writes', category: 'Medical',
      serviceType: 'General', targetAmount: 50000, raisedAmount: 0, donorCount: 0,
      startDate: now.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0],
      beneficiaryName: 'LT Patient', status: 'active', gallery: '[]', tags: '[]',
      organiserId: organiser.id,
    },
    select: { id: true },
  });

  const tasks = Array.from({ length: cfg.count }, (_, i) => async () => {
    const amount = 10 + (i % 9) * 5;
    return { ...await httpReq('POST', '/api/donations', {
      campaignId:  campaign.id,
      amount,
      isAnonymous: i % 3 === 0,
      donorName:   `LT Donor ${i}`,
      donorEmail:  `${TEST_PREFIX}_donor${i}@loadtest.local`,
      message:     `Load test donation #${i}`,
    }), amount };
  });

  const t0      = Date.now();
  const results = await runBatches(tasks, cfg.batchSize);
  const elapsed = Date.now() - t0;
  const stats   = calcStats(results);

  const finalCampaign  = await prisma.campaign.findUnique({ where: { id: campaign.id }, select: { raisedAmount: true } });
  const expectedAmount = results.filter(r => r.status === 200).reduce((s, r) => s + r.amount, 0);
  const actualAmount   = Number(finalCampaign?.raisedAmount || 0);
  const atomicOk       = actualAmount === expectedAmount;
  const passed         = stats.successRate >= 95 && atomicOk;

  printResult(idx, total, 'Donation Flood', `${cfg.count} donations`, passed,
    `${stats.success}/${stats.total}  ${stats.successRate}%  avg ${stats.latencyStats.avg}ms  p95 ${stats.latencyStats.p95}ms  raisedAmount ${atomicOk ? 'OK' : 'MISMATCH'}`);

  logDoc.scenarios.push({
    name: 'Donation Flood', endpoint: 'POST /api/donations',
    dbTable: 'Donation + Campaign', dbOperation: 'INSERT donation + UPDATE raisedAmount (atomic increment)',
    concurrency: cfg.count, batchSize: cfg.batchSize,
    wallClockMs: elapsed, throughputRps: parseFloat((cfg.count / (elapsed / 1000)).toFixed(2)),
    targetCampaignId: campaign.id, expectedRaisedAmount: expectedAmount,
    actualRaisedAmount: actualAmount, concurrencyCheckPassed: atomicOk,
    ...stats,
  });
  writeLog();

  return campaign.id;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCENARIO 6 — Mixed Concurrent Load
// ─────────────────────────────────────────────────────────────────────────────
async function scenarioMixed(idx, total, floodCampaignId, registeredEmails) {
  const cfg       = CFG.mixed;
  const emailPool = registeredEmails.slice(0, 50);

  const tasks = Array.from({ length: cfg.users }, (_, i) => async () => {
    const roll = i % 10;
    if (roll < 4) {
      return httpReq('GET', '/api/campaigns');
    } else if (roll < 7) {
      return httpReq('POST', '/api/auth/register', {
        email: `${TEST_PREFIX}_mx${i}@loadtest.local`,
        password: TEST_PASSWORD, firstName: 'MX', lastName: `User${i}`, role: 'donor',
      });
    } else if (roll < 9) {
      const email = emailPool[i % emailPool.length];
      return email
        ? httpReq('POST', '/api/auth/login', { email, password: TEST_PASSWORD })
        : httpReq('GET', '/api/campaigns');
    } else {
      return floodCampaignId
        ? httpReq('POST', '/api/donations', {
            campaignId: floodCampaignId,
            amount: Math.floor(Math.random() * 90) + 10,
            isAnonymous: false,
            donorName: `MX Donor ${i}`,
            donorEmail: `${TEST_PREFIX}_mxd${i}@loadtest.local`,
          })
        : httpReq('GET', '/api/campaigns');
    }
  });

  const t0      = Date.now();
  const results = await runBatches(tasks, cfg.batchSize);
  const elapsed = Date.now() - t0;
  const stats   = calcStats(results);

  printResult(idx, total, 'Mixed Concurrent Load', `${cfg.users} users`, stats.successRate >= 90,
    `${stats.success}/${stats.total}  ${stats.successRate}%  avg ${stats.latencyStats.avg}ms  p95 ${stats.latencyStats.p95}ms  [40% browse 30% register 20% login 10% donate]`);

  logDoc.scenarios.push({
    name: 'Mixed Concurrent Load',
    endpoints: ['GET /api/campaigns','POST /api/auth/register','POST /api/auth/login','POST /api/donations'],
    dbTables: ['Campaign','User','Donation'], mix: '40% browse / 30% register / 20% login / 10% donate',
    concurrency: cfg.users, batchSize: cfg.batchSize,
    wallClockMs: elapsed, throughputRps: parseFloat((cfg.users / (elapsed / 1000)).toFixed(2)),
    ...stats,
  });
  writeLog();
}

// ─────────────────────────────────────────────────────────────────────────────
//  Cleanup
// ─────────────────────────────────────────────────────────────────────────────
async function cleanup(prisma) {
  const donations = await prisma.donation.deleteMany({ where: { donorEmail: { contains: `${TEST_PREFIX}_` } } });
  const campaigns = await prisma.campaign.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
  const users     = await prisma.user.deleteMany({ where: { email: { contains: `${TEST_PREFIX}_` } } });
  console.log(`\n  Cleanup  ${users.count} users / ${campaigns.count} campaigns / ${donations.count} donations removed`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const prisma = new PrismaClient({ log: [{ level: 'error', emit: 'stdout' }] });
  const LINE   = '='.repeat(62);

  console.log(`\n  ${LINE}`);
  console.log(`  FundBridge -- Database Load Test`);
  console.log(`  ${LINE}`);
  console.log(`  Run ID    ${RUN_ID}`);
  console.log(`  Base URL  ${BASE_URL}`);
  console.log(`  Database  MySQL 8.0 / fundbridge / Prisma ORM`);
  console.log(`  Scenario  ${SCENARIO}`);
  console.log(`  Log file  ${LOG_PATH}`);
  console.log(`  Cleanup   ${NO_CLEANUP ? 'disabled (--no-cleanup)' : 'enabled'}`);
  console.log(`  ${LINE}\n`);

  // Server reachability check
  process.stdout.write('  Server check... ');
  const ping = await httpReq('GET', '/api/campaigns');
  if (!ping.status) {
    console.log(`FAIL\n  Cannot reach ${BASE_URL} -- run: npm run dev\n`);
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`OK (${ping.status})\n`);

  const runAll = SCENARIO === 'all';
  const active = [
    runAll || SCENARIO === 'register',
    runAll || SCENARIO === 'login',
    runAll || SCENARIO === 'browse',
    runAll || SCENARIO === 'campaigns',
    runAll || SCENARIO === 'donations',
    runAll || SCENARIO === 'mixed',
  ];
  const scenarioCount = active.filter(Boolean).length;
  let idx = 0;

  let registeredEmails = [];
  let floodCampaignId  = null;

  try {
    if (active[0]) registeredEmails = await scenarioRegister(++idx, scenarioCount);
    if (active[1]) await scenarioLogin(++idx, scenarioCount, registeredEmails.length ? registeredEmails : [`${TEST_PREFIX}_u00000@loadtest.local`]);
    if (active[2]) await scenarioBrowse(++idx, scenarioCount);
    if (active[3]) await scenarioCampaignCreation(++idx, scenarioCount, prisma);
    if (active[4]) floodCampaignId = await scenarioDonations(++idx, scenarioCount, prisma);
    if (active[5]) await scenarioMixed(++idx, scenarioCount, floodCampaignId, registeredEmails);
  } finally {
    const all         = logDoc.scenarios;
    const totReqs     = all.reduce((s, r) => s + (r.total   || 0), 0);
    const totOk       = all.reduce((s, r) => s + (r.success || 0), 0);
    const overallRate = totReqs ? ((totOk / totReqs) * 100).toFixed(1) : '0.0';
    const passed      = parseFloat(overallRate) >= 95;

    console.log(`\n  ${'-'.repeat(62)}`);
    console.log(`  RESULT  ${passed ? ok('PASS') : fail('FAIL')}  ${totOk}/${totReqs} requests succeeded  (${overallRate}%)`);
    console.log(`  ${'-'.repeat(62)}`);
    console.log(`  Log file  ${LOG_PATH}\n`);

    logDoc.summary = {
      totalRequests: totReqs, totalSuccess: totOk,
      overallSuccessRate: parseFloat(overallRate), passed,
      scenarios: all.map(s => ({
        name: s.name, total: s.total, success: s.success,
        successRate: s.successRate, p95Ms: s.latencyStats?.p95, p99Ms: s.latencyStats?.p99,
      })),
    };
    writeLog();

    if (!NO_CLEANUP) await cleanup(prisma);
    await prisma.$disconnect();
  }
}

main().catch(async e => {
  console.error(`\n  Fatal: ${e.message}`);
  writeLog();
  process.exit(1);
});
