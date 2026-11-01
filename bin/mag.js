#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const Spider = require('../src/engine/spider');
const Deconstructor = require('../src/engine/deconstructor');
const LedgerManager = require('../src/engine/ledger-manager');
const StaticAuditor = require('../src/engine/static-auditor');
const BotHarness = require('../src/engine/bot-harness');

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'help';
const ledgerManager = new LedgerManager();

// Color helpers
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const gray = (s) => `\x1b[90m${s}\x1b[0m`;

function printBanner() {
  console.log(bold(cyan(`
  ███╗   ███╗ █████╗  ██████╗ 
  ████╗ ████║██╔══██╗██╔════╝ 
  ██╔████╔██║███████║██║  ███╗
  ██║╚██╔╝██║██╔══██║██║   ██║
  ██║ ╚═╝ ██║██║  ██║╚██████╔╝
  ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ 
  Master Autonomous Game-Replicator (v1.0.0)
  `)));
}

async function handleIngest(target) {
  if (!target) {
    console.error(red('Error: Target URL or Game Title is required.'));
    console.log(`Usage: ${bold('node bin/mag.js ingest "<url_or_title>"')}`);
    process.exit(1);
  }

  printBanner();
  console.log(bold(`[1/4] SPIDER: Ingesting target metadata for: "${target}"...`));

  const spider = new Spider();
  const deconstructor = new Deconstructor();

  try {
    const dossier = await spider.ingest(target);
    console.log(green(`✓ Successfully fetched game dossier:`));
    console.log(`  Title:   ${bold(dossier.name)} (AppID: ${dossier.appId})`);
    console.log(`  Source:  ${dossier.source}`);
    console.log(`  Genres:  ${dossier.genres.join(', ') || 'General Co-op'}`);

    console.log(bold(`\n[2/4] DECONSTRUCTOR: Deconstructing taxonomy & generating mathematical profiles...`));
    const ledgerData = deconstructor.deconstruct(dossier);

    const savedPath = ledgerManager.saveLedger(ledgerData);
    console.log(green(`✓ Compiled Reconstruction Obligation Ledger saved to: ${savedPath}`));

    console.log(`\n${bold('SUBSYSTEM SPECIFICATIONS:')}`);
    console.log(`  - Physics:    Gravity Y: ${ledgerData.subsystems.physicsProfile.gravity.y}, Hooke's K: ${ledgerData.subsystems.physicsProfile.hookesLawTether.springConstantK}`);
    console.log(`  - Visual:     Dominant Palette: ${ledgerData.subsystems.visualProfile.dominantPalette.name}`);
    console.log(`  - Audio DSP:  ${Object.keys(ledgerData.subsystems.audioDspProfile.soundBank).length} Procedural Sound Presets + Procedural Synth Sequencer`);
    console.log(`  - Co-op DAG:  ${ledgerData.subsystems.asymmetricalCoop.roleP1.roleTitle} & ${ledgerData.subsystems.asymmetricalCoop.roleP2.roleTitle}`);
    console.log(`  - Level DAG:  ${ledgerData.subsystems.levelTopologyDag.totalStages} Stages`);
    console.log(`\n${bold('RECONSTRUCTION OBLIGATIONS:')}`);
    console.log(`  ${green(ledgerData.obligations.length.toString())} Total obligations compiled (${cyan('status: PENDING')})`);

    console.log(`\nNext step: Run ${bold('node bin/mag.js scaffold')} to bundle the runtime SDK.`);
  } catch (err) {
    console.error(red(`Ingest failed: ${err.message}`));
    process.exit(1);
  }
}

function handleScaffold() {
  printBanner();
  console.log(bold('[3/4] SCAFFOLD: Bundling client SDK modules to public/sdk/...'));

  const sdkSourceDir = path.resolve(__dirname, '../src/sdk');
  const publicSdkDir = path.resolve(process.cwd(), 'public/sdk');

  if (!fs.existsSync(sdkSourceDir)) {
    console.error(red(`SDK source directory not found: ${sdkSourceDir}`));
    process.exit(1);
  }

  if (!fs.existsSync(publicSdkDir)) {
    fs.mkdirSync(publicSdkDir, { recursive: true });
  }

  const files = fs.readdirSync(sdkSourceDir).filter(f => f.endsWith('.js'));
  files.forEach(file => {
    const srcPath = path.join(sdkSourceDir, file);
    const destPath = path.join(publicSdkDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ${green('✓')} Copied ${cyan(file)} -> ${gray('public/sdk/' + file)}`);
  });

  console.log(green(`\n✓ All ${files.length} runtime SDK modules scaffolded successfully.`));
  console.log(`Game client can now import:\n  - public/sdk/mag-audio-dsp.js (window.MAGAudio)\n  - public/sdk/mag-vfx-shaders.js (window.MAGVFX)\n  - public/sdk/mag-mobile-hud.js (window.MAGHud)\n  - public/sdk/mag-net-sync.js (window.MAGNet)\n`);
}

async function handleAudit(options = {}) {
  printBanner();
  console.log(bold('[4/4] AUDIT: Executing Dual Static/Runtime Verification Gates...'));

  const ledger = ledgerManager.loadLedger();
  if (!ledger) {
    console.error(red('No mag-ledger.json found. Run `node bin/mag.js ingest <target>` first.'));
    process.exit(1);
  }

  console.log(bold('\n>>> GATE A: Static AST & Codebase Pattern Auditor <<<'));
  const staticAuditor = new StaticAuditor();
  const staticReport = staticAuditor.auditLedger(ledger);

  console.log(`Audited ${staticReport.totalAudited} obligations across source files:`);
  console.log(`  Passed: ${green(staticReport.verifiedCount.toString())}`);
  console.log(`  Failed: ${staticReport.failedCount > 0 ? red(staticReport.failedCount.toString()) : '0'}`);

  // Apply Gate A updates
  ledgerManager.batchUpdateObligations(staticReport.results);

  console.log(bold('\n>>> GATE B: Headless Dual-Bot Telemetry Stress Suite <<<'));
  const botHarness = new BotHarness({ serverUrl: options.serverUrl || 'http://localhost:3000' });
  const botReport = await botHarness.runSuite();

  if (!botReport.serverAlive) {
    console.log(yellow(`[NOTE] Headless Server Test Suite skipped: ${botReport.error}`));
    console.log(gray('  To run Gate B live stress test, start `node server.js` and re-run audit.'));
  } else {
    console.log(`Live telemetry test results (${botReport.passed}/${botReport.passed + botReport.failed} Passed):`);
    botReport.tests.forEach(t => {
      const mark = t.passed ? green('✓') : red('✗');
      console.log(`  ${mark} [${t.id}] ${t.name}: ${t.details}`);

      // Update obligations associated with telemetry tests
      if (t.obligations && t.obligations.length > 0) {
        for (const oblId of t.obligations) {
          ledgerManager.updateObligation(
            oblId,
            t.passed ? 'VERIFIED' : 'FAILED',
            { verifiedBy: 'GATE_B_BOT_HARNESS', testId: t.id, details: t.details }
          );
        }
      }
    });
  }

  // Reload updated ledger and display status matrix
  const updatedLedger = ledgerManager.loadLedger();
  const score = ledgerManager.calculateScore(updatedLedger);
  console.log(ledgerManager.formatTerminalStatus(updatedLedger));

  if (score.percentage === 100 && score.failed === 0) {
    console.log(bold(green('🎉 100% RECONSTRUCTION OBLIGATIONS VERIFIED! Game replication ready for deployment.\n')));
    process.exit(0);
  } else {
    console.log(bold(red(`❌ AUDIT FAILED: ${score.failed + score.pending} obligations unfulfilled. See mag-ledger.json.\n`)));
    process.exit(1);
  }
}

function handleStatus() {
  const ledger = ledgerManager.loadLedger();
  if (!ledger) {
    console.error(red('No mag-ledger.json found. Run `node bin/mag.js ingest <target>` first.'));
    process.exit(1);
  }
  console.log(ledgerManager.formatTerminalStatus(ledger));
}

function showHelp() {
  printBanner();
  console.log(`${bold('COMMANDS:')}
  ${cyan('ingest <url|title>')}  Deconstructs Steam/game URL into physics, visual, audio & obligations ledger
  ${cyan('scaffold')}           Copies browser-ready SDK modules into public/sdk/
  ${cyan('audit')}              Runs Dual-Gate Static and Headless Bot verifications against codebase
  ${cyan('status')}             Displays current mag-ledger.json completion percentage & matrix
  ${cyan('all <url|title>')}    Executes ingest -> scaffold -> audit in unified sequence
  `);
}

// Router
(async () => {
  switch (command) {
    case 'ingest':
      await handleIngest(args[1]);
      break;
    case 'scaffold':
      handleScaffold();
      break;
    case 'audit':
      await handleAudit();
      break;
    case 'status':
      handleStatus();
      break;
    case 'all':
      await handleIngest(args[1] || 'It Takes Two');
      handleScaffold();
      await handleAudit();
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
})();
