import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

console.log(`[ingest] Assembling ${manifest.packageName}@${manifest.version}...`);

const workDir = path.join(rootDir, '.temp');
const distDir = path.join(rootDir, 'dist');

fs.rmSync(workDir, { recursive: true, force: true });
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(workDir, { recursive: true });
fs.mkdirSync(distDir, { recursive: true });

// 1. Fetch upstream tarballs directly from npm
console.log(`[ingest] Downloading tinymce@${manifest.sources.tinymce.version}...`);
execSync(`npm pack tinymce@${manifest.sources.tinymce.version}`, { cwd: workDir, stdio: 'inherit' });

console.log(`[ingest] Downloading tinymce-premium@${manifest.sources.tinymcePremium.version}...`);
execSync(`npm pack tinymce-premium@${manifest.sources.tinymcePremium.version}`, { cwd: workDir, stdio: 'inherit' });

// 2. Extract tarballs
console.log('[ingest] Extracting packages...');
execSync(`tar -xzf tinymce-${manifest.sources.tinymce.version}.tgz`, { cwd: workDir });
fs.renameSync(path.join(workDir, 'package'), path.join(workDir, 'tinymce-core'));

execSync(`tar -xzf tinymce-premium-${manifest.sources.tinymcePremium.version}.tgz`, { cwd: workDir });
fs.renameSync(path.join(workDir, 'package'), path.join(workDir, 'tinymce-premium'));

// 3. Assemble dist
console.log('[ingest] Assembling distribution bundle...');
// Copy core assets
fs.cpSync(path.join(workDir, 'tinymce-core'), distDir, { recursive: true });

// Overlay premium plugins and skins
fs.cpSync(path.join(workDir, 'tinymce-premium/plugins'), path.join(distDir, 'plugins'), { recursive: true });
fs.cpSync(path.join(workDir, 'tinymce-premium/skins'), path.join(distDir, 'skins'), { recursive: true });
if (fs.existsSync(path.join(workDir, 'tinymce-premium/langs'))) {
  fs.cpSync(path.join(workDir, 'tinymce-premium/langs'), path.join(distDir, 'langs'), { recursive: true });
}

// 4. Validate required enterprise plugins are physically present
for (const plugin of manifest.requiredPlugins) {
  const pluginPath = path.join(distDir, 'plugins', plugin, 'plugin.min.js');
  if (!fs.existsSync(pluginPath)) {
    throw new Error(`[ingest] Required plugin missing: ${plugin} at ${pluginPath}`);
  }
}

// Specifically validate commercial license key manager binary
const mgrPath = path.join(distDir, 'plugins/licensekeymanager/js/commerciallicensekeymanager.min.js');
if (!fs.existsSync(mgrPath)) {
  throw new Error(`[ingest] Required commerciallicensekeymanager missing at ${mgrPath}`);
}

// 5. Generate clean package.json with zero scripts (Yarn 4 lifecycle safety)
const pkgJson = {
  name: manifest.packageName,
  version: manifest.version,
  description: "Banno Tinymce Commercial Distribution",
  main: "tinymce.js",
  types: "./tinymce.d.ts",
  license: "UNLICENSED",
  author: "@banno/content-ux",
  scripts: {}
};
fs.writeFileSync(path.join(distDir, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n');

// 6. Write version.txt and license.txt
fs.writeFileSync(path.join(distDir, 'version.txt'), `${manifest.version}\n`);
fs.writeFileSync(path.join(distDir, 'license.txt'), `Copyright (c) 2026 Ephox Corporation DBA Tiny Technologies, Inc.
Use of this software is covered by the Tiny Technologies, Inc Software Terms & Conditions of Use presented at https://about.tiny.cloud/legal/.\n`);

// Clean workDir
fs.rmSync(workDir, { recursive: true, force: true });

console.log(`[ingest] Successfully built ${manifest.packageName}@${manifest.version} in dist/`);
