'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Antigravity MAG v2.0 — Reconstruction Obligation Ledger Manager
 */
class LedgerManagerV2 {
  constructor(baseDir = process.cwd(), filename = 'mag-ledger.json') {
    this.baseDir = baseDir;
    this.defaultPath = path.resolve(this.baseDir, filename);
  }

  loadLedger(targetPath = this.defaultPath) {
    if (!fs.existsSync(targetPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    } catch (err) {
      throw new Error(`Failed to parse ledger at ${targetPath}: ${err.message}`);
    }
  }

  saveLedger(ledgerData, targetPath = this.defaultPath) {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(ledgerData, null, 2), 'utf8');
    return targetPath;
  }

  batchUpdateObligations(updates, targetPath = this.defaultPath) {
    const ledger = this.loadLedger(targetPath);
    if (!ledger) throw new Error('Ledger not found');

    for (const u of updates) {
      const item = (ledger.obligations || []).find(o => o.obligationId === u.obligationId);
      if (item) {
        item.status = u.status;
        item.evidence = u.evidence || item.evidence;
        item.lastAuditedAt = new Date().toISOString();
      }
    }

    this.saveLedger(ledger, targetPath);
    return this.calculateScore(ledger);
  }

  recordDeployment(deploymentInfo, targetPath = this.defaultPath) {
    const ledger = this.loadLedger(targetPath);
    if (!ledger) return;
    ledger.deployment = {
      ...deploymentInfo,
      deployedAt: new Date().toISOString()
    };
    this.saveLedger(ledger, targetPath);
  }

  calculateScore(ledger) {
    if (!ledger || !Array.isArray(ledger.obligations)) {
      return { total: 0, verified: 0, failed: 0, pending: 0, percentage: 0, categories: {} };
    }

    const total = ledger.obligations.length;
    let verified = 0, failed = 0, pending = 0;
    const categories = {};

    for (const o of ledger.obligations) {
      const c = o.category || 'GENERAL';
      if (!categories[c]) categories[c] = { total: 0, verified: 0, failed: 0, pending: 0 };
      categories[c].total++;

      if (o.status === 'VERIFIED') {
        verified++;
        categories[c].verified++;
      } else if (o.status === 'FAILED') {
        failed++;
        categories[c].failed++;
      } else {
        pending++;
        categories[c].pending++;
      }
    }

    const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { total, verified, failed, pending, percentage, categories };
  }

  formatReport(ledger) {
    if (!ledger) return '\x1b[31mNo mag-ledger.json found. Run `node bin/agy-mag.js ingest "<game>"` first.\x1b[0m';

    const score = this.calculateScore(ledger);
    const out = [];

    out.push('\n\x1b[1m\x1b[36m╔══════════════════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    out.push(`\x1b[1m\x1b[36m║\x1b[0m  \x1b[1mANTIGRAVITY MAG v2.0 OBLIGATION LEDGER:\x1b[0m \x1b[33m${(ledger.gameTitle || 'Unknown').padEnd(46)}\x1b[0m\x1b[1m\x1b[36m║\x1b[0m`);
    out.push(`\x1b[1m\x1b[36m╚══════════════════════════════════════════════════════════════════════════════════════════╝\x1b[0m`);

    out.push('\n\x1b[1mSUBSYSTEM CATEGORY MATRIX:\x1b[0m');
    for (const [cat, stats] of Object.entries(score.categories)) {
      const pct = Math.round((stats.verified / stats.total) * 100);
      const filled = Math.round(pct / 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
      const col = pct === 100 ? '\x1b[32m' : (pct > 0 ? '\x1b[33m' : '\x1b[90m');
      out.push(`  \x1b[35m${cat.padEnd(18)}\x1b[0m [${col}${bar}\x1b[0m] ${col}${pct.toString().padStart(3)}%\x1b[0m (${stats.verified}/${stats.total})`);
    }

    out.push('\n\x1b[1mOBLIGATION DETAILS:\x1b[0m');
    out.push('  ID            CATEGORY           STATUS     TITLE');
    out.push('  ──────────────────────────────────────────────────────────────────────────────────────────');

    for (const o of ledger.obligations) {
      const st = o.status === 'VERIFIED'
        ? '\x1b[32m✓ VERIFIED\x1b[0m'
        : (o.status === 'FAILED' ? '\x1b[31m✗ FAILED  \x1b[0m' : '\x1b[33m○ PENDING \x1b[0m');
      out.push(`  \x1b[36m${o.obligationId.padEnd(13)}\x1b[0m \x1b[90m${o.category.padEnd(18)}\x1b[0m ${st} ${o.title}`);
    }

    out.push('  ──────────────────────────────────────────────────────────────────────────────────────────');
    const col = score.percentage === 100 ? '\x1b[32m' : '\x1b[33m';
    out.push(`  \x1b[1mTOTAL SCORE: ${col}${score.percentage}% (${score.verified}/${score.total} Verified | ${score.failed} Failed | ${score.pending} Pending)\x1b[0m`);

    if (ledger.deployment && ledger.deployment.liveUrl) {
      out.push(`\n  \x1b[1m\x1b[32m🌐 LIVE PLAYABLE URL:\x1b[0m \x1b[4m\x1b[36m${ledger.deployment.liveUrl}\x1b[0m`);
    }
    out.push('');
    return out.join('\n');
  }
}

module.exports = LedgerManagerV2;
