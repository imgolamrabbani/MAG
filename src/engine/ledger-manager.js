'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Manages the Reconstruction Obligation Ledger (mag-ledger.json)
 * Tracks, validates, scores, and formats the empirical reconstruction progress.
 */
class LedgerManager {
  constructor(defaultPath = 'mag-ledger.json') {
    this.defaultPath = path.resolve(process.cwd(), defaultPath);
  }

  /**
   * Loads the ledger from disk.
   */
  loadLedger(targetPath = this.defaultPath) {
    const resolved = path.resolve(process.cwd(), targetPath);
    if (!fs.existsSync(resolved)) {
      return null;
    }
    try {
      const raw = fs.readFileSync(resolved, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to read/parse ledger at ${resolved}: ${err.message}`);
    }
  }

  /**
   * Saves the ledger to disk atomically.
   */
  saveLedger(ledgerData, targetPath = this.defaultPath) {
    const resolved = path.resolve(process.cwd(), targetPath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const serialized = JSON.stringify(ledgerData, null, 2);
    fs.writeFileSync(resolved, serialized, 'utf8');
    return resolved;
  }

  /**
   * Updates an obligation by ID and persists to disk.
   */
  updateObligation(obligationId, status, evidence = null, targetPath = this.defaultPath) {
    const ledger = this.loadLedger(targetPath);
    if (!ledger) {
      throw new Error(`No ledger found at ${targetPath} to update`);
    }

    const obl = (ledger.obligations || []).find(o => o.obligationId === obligationId);
    if (!obl) {
      throw new Error(`Obligation ID ${obligationId} not found in ledger`);
    }

    obl.status = status;
    obl.evidence = evidence;
    obl.lastAuditedAt = new Date().toISOString();

    this.saveLedger(ledger, targetPath);
    return obl;
  }

  /**
   * Batch updates multiple obligations.
   */
  batchUpdateObligations(updates, targetPath = this.defaultPath) {
    const ledger = this.loadLedger(targetPath);
    if (!ledger) {
      throw new Error(`No ledger found at ${targetPath} to update`);
    }

    for (const update of updates) {
      const obl = (ledger.obligations || []).find(o => o.obligationId === update.obligationId);
      if (obl) {
        obl.status = update.status;
        obl.evidence = update.evidence || obl.evidence;
        obl.lastAuditedAt = new Date().toISOString();
      }
    }

    this.saveLedger(ledger, targetPath);
    return this.calculateScore(ledger);
  }

  /**
   * Computes metrics and verification score.
   */
  calculateScore(ledger) {
    if (!ledger || !Array.isArray(ledger.obligations)) {
      return { total: 0, verified: 0, failed: 0, pending: 0, percentage: 0 };
    }

    const total = ledger.obligations.length;
    let verified = 0;
    let failed = 0;
    let pending = 0;

    const categoryBreakdown = {};

    for (const obl of ledger.obligations) {
      const cat = obl.category || 'OTHER';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { total: 0, verified: 0, failed: 0, pending: 0 };
      }
      categoryBreakdown[cat].total++;

      if (obl.status === 'VERIFIED') {
        verified++;
        categoryBreakdown[cat].verified++;
      } else if (obl.status === 'FAILED') {
        failed++;
        categoryBreakdown[cat].failed++;
      } else {
        pending++;
        categoryBreakdown[cat].pending++;
      }
    }

    const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;

    return {
      total,
      verified,
      failed,
      pending,
      percentage,
      categoryBreakdown
    };
  }

  /**
   * Formats a clean ANSI terminal table of obligations and summary.
   */
  formatTerminalStatus(ledger) {
    if (!ledger) {
      return '\x1b[31m[MAG LEDGER]\x1b[0m No active ledger found. Run `mag ingest <target>` first.';
    }

    const score = this.calculateScore(ledger);
    const lines = [];

    lines.push('\n\x1b[1m\x1b[36m========================================================================================\x1b[0m');
    lines.push(`\x1b[1m\x1b[37m  MAG RECONSTRUCTION OBLIGATION LEDGER: \x1b[33m${ledger.gameTitle} (${ledger.gameId || 'Custom'})\x1b[0m`);
    lines.push(`\x1b[90m  Source: ${ledger.source} | Last Updated: ${ledger.timestamp || 'N/A'}\x1b[0m`);
    lines.push('\x1b[1m\x1b[36m========================================================================================\x1b[0m');

    // Category breakdown
    lines.push('\n\x1b[1mCATEGORY PROGRESSION:\x1b[0m');
    for (const [cat, data] of Object.entries(score.categoryBreakdown)) {
      const catPct = Math.round((data.verified / data.total) * 100);
      const barFilled = Math.round(catPct / 10);
      const bar = '█'.repeat(barFilled) + '░'.repeat(10 - barFilled);
      const color = catPct === 100 ? '\x1b[32m' : (catPct > 0 ? '\x1b[33m' : '\x1b[90m');
      lines.push(`  \x1b[35m${cat.padEnd(14)}\x1b[0m [${color}${bar}\x1b[0m] ${color}${catPct.toString().padStart(3)}%\x1b[0m (${data.verified}/${data.total})`);
    }

    lines.push('\n\x1b[1mOBLIGATION MATRIX:\x1b[0m');
    lines.push('  ID            CATEGORY       STATUS       TITLE');
    lines.push('  --------------------------------------------------------------------------------------');

    for (const obl of ledger.obligations) {
      let statusStr = '\x1b[33mPENDING \x1b[0m';
      if (obl.status === 'VERIFIED') {
        statusStr = '\x1b[32mVERIFIED\x1b[0m';
      } else if (obl.status === 'FAILED') {
        statusStr = '\x1b[31mFAILED  \x1b[0m';
      }

      const idStr = `\x1b[36m${obl.obligationId.padEnd(13)}\x1b[0m`;
      const catStr = `\x1b[90m${(obl.category || '').padEnd(14)}\x1b[0m`;
      const titleStr = obl.title.length > 45 ? obl.title.substring(0, 42) + '...' : obl.title;

      lines.push(`  ${idStr} ${catStr} ${statusStr} ${titleStr}`);
      if (obl.status === 'FAILED' && obl.evidence && obl.evidence.reason) {
        lines.push(`    \x1b[31m↳ Reason:\x1b[0m ${obl.evidence.reason}`);
      }
    }

    lines.push('  --------------------------------------------------------------------------------------');
    const totalColor = score.percentage === 100 ? '\x1b[32m' : (score.percentage > 0 ? '\x1b[33m' : '\x1b[31m');
    lines.push(`\n  \x1b[1mTOTAL COMPLETION: ${totalColor}${score.percentage}% (${score.verified}/${score.total} Verified, ${score.failed} Failed, ${score.pending} Pending)\x1b[0m\n`);

    return lines.join('\n');
  }
}

module.exports = LedgerManager;
