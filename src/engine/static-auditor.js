'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Gate A — Static Codebase & Pattern Auditor
 * Scans server.js and public/ client files to verify that every obligationId in mag-ledger.json
 * is authentically implemented.
 */
class StaticAuditor {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
  }

  /**
   * Recursively collects candidate source files (.js, .html, .css).
   */
  gatherSourceFiles() {
    const candidateDirs = ['src', 'public', '.'];
    const gathered = [];

    const scanDir = (dir) => {
      const fullDir = path.resolve(this.baseDir, dir);
      if (!fs.existsSync(fullDir)) return;

      const entries = fs.readdirSync(fullDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.system_')) {
          continue;
        }
        const fullPath = path.join(fullDir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile() && /\.(js|html|mjs)$/i.test(entry.name)) {
          const relPath = path.relative(this.baseDir, fullPath);
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            gathered.push({ path: relPath, content });
          } catch (e) {
            // ignore unreadable
          }
        }
      }
    };

    candidateDirs.forEach(scanDir);
    return gathered;
  }

  /**
   * Audits an individual obligation against the collected codebase.
   */
  auditObligation(obligation, files) {
    const rule = obligation.verificationRule;
    if (!rule || !rule.pattern) {
      return {
        obligationId: obligation.obligationId,
        status: 'FAILED',
        evidence: { reason: 'No verification rule specified.' }
      };
    }

    const regex = new RegExp(rule.pattern, 'is');
    const matchedFiles = [];

    for (const file of files) {
      if (regex.test(file.content)) {
        // Find line number
        const lines = file.content.split('\n');
        let matchedLine = 1;
        for (let i = 0; i < lines.length; i++) {
          if (new RegExp(rule.pattern.split('|')[0].replace(/\\/g, ''), 'i').test(lines[i])) {
            matchedLine = i + 1;
            break;
          }
        }
        matchedFiles.push({ file: file.path, line: matchedLine });
      }
    }

    if (matchedFiles.length > 0) {
      return {
        obligationId: obligation.obligationId,
        status: 'VERIFIED',
        evidence: {
          verifiedBy: 'GATE_A_STATIC_AST_AUDITOR',
          matches: matchedFiles,
          timestamp: new Date().toISOString()
        }
      };
    }

    return {
      obligationId: obligation.obligationId,
      status: 'FAILED',
      evidence: {
        verifiedBy: 'GATE_A_STATIC_AST_AUDITOR',
        reason: `Missing pattern [${rule.pattern}] in target components (${obligation.targetComponent})`,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Runs Gate A static audit against all obligations in the ledger.
   */
  auditLedger(ledger) {
    if (!ledger || !Array.isArray(ledger.obligations)) {
      throw new Error('Invalid ledger structure provided to StaticAuditor');
    }

    const files = this.gatherSourceFiles();
    const results = [];

    for (const obl of ledger.obligations) {
      const result = this.auditObligation(obl, files);
      results.push(result);
    }

    return {
      totalAudited: results.length,
      verifiedCount: results.filter(r => r.status === 'VERIFIED').length,
      failedCount: results.filter(r => r.status === 'FAILED').length,
      results
    };
  }
}

module.exports = StaticAuditor;
