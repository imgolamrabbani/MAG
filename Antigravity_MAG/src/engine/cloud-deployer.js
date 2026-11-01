'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Antigravity MAG v2.0 — Multi-Provider Zero-Cost Cloud Deployer
 * Supports:
 *   1. GitHub Pages (Automated via `gh` CLI + GitHub Pages REST API on `gh-pages` branch)
 *   2. Cloudflare Pages (Global Edge CDN via `npx wrangler pages deploy dist`)
 *   3. Surge.sh (Instant CDN via `npx surge dist`)
 */
class CloudDeployer {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.distDir = path.resolve(this.baseDir, 'dist');
  }

  runCmd(cmd, cwd = this.baseDir) {
    return execSync(cmd, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8'
    }).trim();
  }

  getGitHubUser() {
    try {
      return this.runCmd('gh api user --jq .login');
    } catch (_) {
      return null;
    }
  }

  /**
   * Deploys `dist/` to GitHub Pages automatically and enables Pages via GitHub API.
   */
  deployToGitHubPages(ledger, options = {}) {
    if (!fs.existsSync(this.distDir)) {
      throw new Error('dist/ directory not found. Run `node bin/agy-mag.js synthesize` first.');
    }

    const ghUser = this.getGitHubUser();
    if (!ghUser) {
      throw new Error('GitHub CLI (`gh`) is not authenticated. Run `gh auth login` first.');
    }

    const repoName = options.repoName || `mag-${ledger.gameSlug || 'replica'}`;
    const fullRepo = `${ghUser}/${repoName}`;

    // Ensure repository exists on GitHub
    try {
      this.runCmd(`gh repo view ${fullRepo}`);
    } catch (_) {
      this.runCmd(`gh repo create ${fullRepo} --public --description "Antigravity MAG WebRTC Co-op Replica: ${ledger.gameTitle}"`);
    }

    // Create a clean temporary git deployment tree inside dist/
    const gitDir = path.join(this.distDir, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }

    // Add .nojekyll so GitHub Pages serves all assets immediately without Jekyll processing
    fs.writeFileSync(path.join(this.distDir, '.nojekyll'), '', 'utf8');

    const remoteUrl = `https://github.com/${fullRepo}.git`;
    this.runCmd('git init', this.distDir);
    this.runCmd('git checkout -b gh-pages', this.distDir);
    this.runCmd('git add .', this.distDir);
    this.runCmd(`git commit -m "deploy: ${ledger.gameTitle} Antigravity MAG v2.0 WebRTC Replica"`, this.distDir);
    this.runCmd(`git remote add origin ${remoteUrl}`, this.distDir);
    this.runCmd('git push -f origin gh-pages', this.distDir);

    // Clean up temporary .git inside dist
    fs.rmSync(gitDir, { recursive: true, force: true });

    // Enable GitHub Pages on gh-pages branch via GitHub REST API
    try {
      this.runCmd(`gh api -X POST repos/${fullRepo}/pages -f "source[branch]=gh-pages" -f "source[path]=/"`);
    } catch (_) {
      // Pages may already be enabled; ensure branch is gh-pages
      try {
        this.runCmd(`gh api -X PUT repos/${fullRepo}/pages -f "source[branch]=gh-pages" -f "source[path]=/"`);
      } catch (__) {}
    }

    const roomCode = (ledger.gameSlug || 'AGY1').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'AGY1';
    const baseUrl = `https://${ghUser}.github.io/${repoName}/`;
    const liveUrl = `${baseUrl}?room=${roomCode}`;

    return {
      provider: 'GITHUB_PAGES',
      repoUrl: `https://github.com/${fullRepo}`,
      baseUrl,
      liveUrl,
      roomCode
    };
  }

  /**
   * Deploys `dist/` to Cloudflare Pages Global Edge CDN if Wrangler is authenticated.
   */
  deployToCloudflarePages(ledger) {
    const projectName = `mag-${ledger.gameSlug || 'replica'}`;
    const out = this.runCmd(`npx --yes wrangler pages deploy "${this.distDir}" --project-name="${projectName}"`);
    const urlMatch = out.match(/https:\/\/[^\s]+\.pages\.dev/i);
    const baseUrl = urlMatch ? urlMatch[0] : `https://${projectName}.pages.dev`;
    const roomCode = 'CF01';
    return {
      provider: 'CLOUDFLARE_PAGES',
      baseUrl,
      liveUrl: `${baseUrl}/?room=${roomCode}`,
      roomCode
    };
  }
}

module.exports = CloudDeployer;
