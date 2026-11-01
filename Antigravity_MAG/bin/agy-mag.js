#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const SpiderV2 = require('../src/engine/spider-v2');
const DeconstructorV2 = require('../src/engine/deconstructor-v2');
const LedgerManagerV2 = require('../src/engine/ledger-manager-v2');
const GameSynthesizer = require('../src/engine/synthesizer');
const StaticAuditorV2 = require('../src/engine/static-auditor-v2');
const P2PBotHarness = require('../src/engine/p2p-bot-harness');
const CloudDeployer = require('../src/engine/cloud-deployer');

const baseDir = path.resolve(__dirname, '..');
const ledgerManager = new LedgerManagerV2(baseDir);

const args = process.argv.slice(2);
const command = (args[0] || 'help').toLowerCase();

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function printHeader() {
  console.log(bold(cyan(`
  ╔══════════════════════════════════════════════════════════════════════╗
  ║   🚀 ANTIGRAVITY MAG v2.0 — Autonomous WebRTC Co-op Game Replicator  ║
  ║   Empirical Deconstruction • 30-Point Ledger • Zero-Cost Cloud CDN   ║
  ╚══════════════════════════════════════════════════════════════════════╝`)));
}

async function runIngest(target) {
  if (!target) {
    console.error(red('Error: Target game URL or title required.'));
    process.exit(1);
  }
  console.log(bold(`\n[STAGE 1/5] SPIDER v2: Scraping & Deconstructing "${target}"...`));
  const spider = new SpiderV2();
  const deconstructor = new DeconstructorV2();

  const dossier = await spider.ingest(target);
  console.log(green(`  ✓ Target Resolved: ${bold(dossier.name)} (AppID: ${dossier.appId}, Slug: ${dossier.slug})`));
  console.log(`  ✓ Source: ${dossier.source}`);

  const ledger = deconstructor.deconstruct(dossier);
  const savedPath = ledgerManager.saveLedger(ledger);
  console.log(green(`  ✓ Compiled 30 Reconstruction Obligations -> ${savedPath}`));
  return ledger;
}

function runScaffold() {
  console.log(bold('\n[STAGE 2/5] SCAFFOLD v2: Deploying Runtime SDKs (WebRTC P2P, Verlet VFX, PolyAudio, PWA HUD)...'));
  const sdkSrc = path.join(baseDir, 'src/sdk');
  const targets = [path.join(baseDir, 'dist/sdk'), path.join(baseDir, 'public/sdk')];

  const files = fs.readdirSync(sdkSrc).filter(f => f.endsWith('.js'));
  for (const dest of targets) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of files) {
      fs.copyFileSync(path.join(sdkSrc, file), path.join(dest, file));
    }
  }
  console.log(green(`  ✓ Scaffolded ${files.length} v2 SDK modules to dist/sdk/ and public/sdk/`));
}

function runSynthesize() {
  console.log(bold('\n[STAGE 3/5] SYNTHESIZER: Compiling Self-Contained Playable 3-Stage Phaser + WebRTC Bundle...'));
  const ledger = ledgerManager.loadLedger();
  if (!ledger) {
    console.error(red('No mag-ledger.json found. Run `ingest` first.'));
    process.exit(1);
  }
  const synth = new GameSynthesizer(baseDir);
  const res = synth.synthesize(ledger);
  console.log(green(`  ✓ Synthesized ${res.files.length} production files in ${res.distDir}`));
  return res;
}

async function runAudit() {
  console.log(bold('\n[STAGE 4/5] DUAL-GATE VERIFIER: Auditing Static AST + Headless P2P & Verlet Telemetry...'));
  const ledger = ledgerManager.loadLedger();
  if (!ledger) {
    console.error(red('No mag-ledger.json found. Run `ingest` first.'));
    process.exit(1);
  }

  // Gate A
  const auditor = new StaticAuditorV2(baseDir);
  const gateA = auditor.auditLedger(ledger);
  console.log(`  • Gate A (Static AST 30-Point Scan): ${green(gateA.verified + '/' + gateA.total + ' Verified')}`);
  ledgerManager.batchUpdateObligations(gateA.results);

  // Gate B
  const harness = new P2PBotHarness();
  const gateB = await harness.runSuite();
  console.log(`  • Gate B (Headless P2P + Verlet + AI Companion Suite): ${green(gateB.passed + '/' + gateB.total + ' Passed')}`);

  for (const t of gateB.tests) {
    const icon = t.passed ? green('✓') : red('✗');
    console.log(`    ${icon} [${t.id}] ${t.name} -> ${t.details}`);
  }

  const updated = ledgerManager.loadLedger();
  const score = ledgerManager.calculateScore(updated);
  console.log(ledgerManager.formatReport(updated));

  if (score.percentage !== 100) {
    console.error(red(`❌ Audit failed: ${score.failed + score.pending} obligations unverified.`));
    process.exit(1);
  }
  console.log(bold(green('  ✓ 100% (30/30) OBLIGATIONS VERIFIED ACROSS BOTH GATES!')));
  return updated;
}

function runDeploy(providerArg = 'github') {
  console.log(bold(`\n[STAGE 5/5] CLOUD DEPLOYER: Publishing Serverless WebRTC Game to ${providerArg.toUpperCase()}...`));
  const ledger = ledgerManager.loadLedger();
  if (!ledger) {
    console.error(red('No mag-ledger.json found. Run `ingest` and `synthesize` first.'));
    process.exit(1);
  }

  const deployer = new CloudDeployer(baseDir);
  const info = providerArg === 'cloudflare'
    ? deployer.deployToCloudflarePages(ledger)
    : deployer.deployToGitHubPages(ledger);

  ledgerManager.recordDeployment(info);

  console.log(bold(green('\n  ╔══════════════════════════════════════════════════════════════════════════════╗')));
  console.log(bold(green('  ║  🌐 LIVE SERVERLESS MULTIPLAYER DEPLOYMENT COMPLETE!                         ║')));
  console.log(bold(green('  ╚══════════════════════════════════════════════════════════════════════════════╝')));
  console.log(`  • Provider:        ${cyan(info.provider)}`);
  if (info.repoUrl) console.log(`  • GitHub Repo:     ${cyan(info.repoUrl)}`);
  console.log(`  • Player 1 & 2 URL:${bold(green(' ' + info.liveUrl))}`);
  console.log(`  • Room Code:       ${yellow(info.roomCode)} (Share the exact URL above with Player 2 to connect P2P!)\n`);
  return info;
}

(async () => {
  printHeader();
  const providerFlag = args.find(a => a.startsWith('--provider='));
  const provider = providerFlag ? providerFlag.split('=')[1] : 'github';

  switch (command) {
    case 'ingest':
      await runIngest(args[1]);
      break;
    case 'scaffold':
      runScaffold();
      break;
    case 'synthesize':
      runSynthesize();
      break;
    case 'audit':
      await runAudit();
      break;
    case 'deploy':
      runDeploy(provider);
      break;
    case 'ship':
      await runIngest(args[1] || 'It Takes Two');
      runScaffold();
      runSynthesize();
      await runAudit();
      runDeploy(provider);
      break;
    case 'status':
      console.log(ledgerManager.formatReport(ledgerManager.loadLedger()));
      break;
    default:
      console.log(`
  ${bold('USAGE:')}
    node bin/agy-mag.js ${cyan('ship "<game_url_or_title>"')}    Full autonomous pipeline: ingest -> scaffold -> synthesize -> audit -> deploy live
    node bin/agy-mag.js ${cyan('ingest "<game_url_or_title>"')}  Scrape Steam/Itch & generate 30-obligation mag-ledger.json
    node bin/agy-mag.js ${cyan('scaffold')}                      Copy v2 P2P, Verlet, Audio & HUD SDKs
    node bin/agy-mag.js ${cyan('synthesize')}                    Compile playable 3-stage Phaser 3 + WebRTC P2P game into dist/
    node bin/agy-mag.js ${cyan('audit')}                         Run Gate A (30 AST checks) + Gate B (8 Headless P2P/Physics tests)
    node bin/agy-mag.js ${cyan('deploy [--provider=github|cloudflare]')}  Publish dist/ live for free
    node bin/agy-mag.js ${cyan('status')}                        Print ledger progress matrix
      `);
      break;
  }
})();
