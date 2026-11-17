import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
const distDir = path.join(rootDir, 'dist');
const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf8'));

console.log(`[verify] Verifying assembled distribution in ${distDir}...`);

if (!fs.existsSync(distDir)) {
  throw new Error('[verify] dist/ directory does not exist. Run npm run ingest first.');
}

// 1. Verify package.json
const pkgPath = path.join(distDir, 'package.json');
if (!fs.existsSync(pkgPath)) throw new Error('[verify] Missing package.json in dist');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

if (pkg.name !== manifest.packageName) throw new Error(`[verify] Name mismatch: ${pkg.name} !== ${manifest.packageName}`);
if (pkg.version !== manifest.version) throw new Error(`[verify] Version mismatch: ${pkg.version} !== ${manifest.version}`);
if (Object.keys(pkg.scripts || {}).length > 0) throw new Error('[verify] Package must not contain any lifecycle scripts!');

// 2. Verify critical binaries and plugins
const criticalFiles = [
  'tinymce.js',
  'tinymce.min.js',
  'tinymce.d.ts',
  'themes/silver/theme.min.js',
  'models/dom/model.min.js',
  'plugins/licensekeymanager/plugin.min.js',
  'plugins/licensekeymanager/js/commerciallicensekeymanager.min.js',
  'plugins/advcode/plugin.min.js',
  'plugins/powerpaste/plugin.min.js',
  'plugins/editimage/plugin.min.js',
  'plugins/tableofcontents/plugin.min.js'
];

for (const file of criticalFiles) {
  const p = path.join(distDir, file);
  if (!fs.existsSync(p)) {
    throw new Error(`[verify] Critical distribution file missing: ${file}`);
  }
}

console.log(`[verify] Verification PASSED. ${manifest.packageName}@${manifest.version} is valid and ready for publishing.`);
