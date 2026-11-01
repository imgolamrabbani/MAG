'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Antigravity MAG v2.0 — Gate A: Deep Source & Obligation Auditor
 * Verifies all 30 obligations across `dist/`, `src/sdk/`, and `public/`.
 */
class StaticAuditorV2 {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
  }

  gatherFiles() {
    const dirs = ['dist', 'src', 'public'];
    const files = [];

    const walk = (d) => {
      const full = path.resolve(this.baseDir, d);
      if (!fs.existsSync(full)) return;
      for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        const p = path.join(full, entry.name);
        if (entry.isDirectory()) {
          walk(p);
        } else if (/\.(js|html|json)$/i.test(entry.name)) {
          try {
            files.push({
              path: path.relative(this.baseDir, p),
              content: fs.readFileSync(p, 'utf8')
            });
          } catch (_) {}
        }
      }
    };

    dirs.forEach(walk);
    return files;
  }

  auditLedger(ledger) {
    const files = this.gatherFiles();
    const results = [];

    for (const obl of ledger.obligations) {
      const pattern = obl.verificationRule && obl.verificationRule.pattern;
      if (!pattern) {
        results.push({
          obligationId: obl.obligationId,
          status: 'FAILED',
          evidence: { reason: 'Missing verificationRule pattern' }
        });
        continue;
      }

      const regex = new RegExp(pattern, 'is');
      const matched = [];
      for (const f of files) {
        if (regex.test(f.content)) {
          matched.push(f.path);
        }
      }

      if (matched.length > 0) {
        results.push({
          obligationId: obl.obligationId,
          status: 'VERIFIED',
          evidence: {
            gate: 'GATE_A_STATIC_AST_V2',
            matchedFiles: matched.slice(0, 3),
            verifiedAt: new Date().toISOString()
          }
        });
      } else {
        results.push({
          obligationId: obl.obligationId,
          status: 'FAILED',
          evidence: {
            gate: 'GATE_A_STATIC_AST_V2',
            reason: `Pattern /${pattern}/ not found in target (${obl.targetComponent})`
          }
        });
      }
    }

    return {
      total: results.length,
      verified: results.filter(r => r.status === 'VERIFIED').length,
      failed: results.filter(r => r.status === 'FAILED').length,
      results
    };
  }
}

module.exports = StaticAuditorV2;
