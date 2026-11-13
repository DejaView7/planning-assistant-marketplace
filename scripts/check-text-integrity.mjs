import {readFile, readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const excluded = new Set(['.git', 'node_modules', '.venv', '__pycache__']);
const controls = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd]/u;
const personalPath = /\b[A-Za-z]:[\\/]Users[\\/][^\s/\\]+|\/Users\/[^\s/]+\/|\/home\/[^\s/]+\//u;

export function inspectText(text, file) {
  const findings = [];
  for (const [index, line] of text.split(/\r?\n/u).entries()) {
    const add = (level, code) => findings.push({file, line: index + 1, level, code});
    if (controls.test(line)) add('error', 'invalid-character');
    if (personalPath.test(line)) add('error', 'personal-path');
    if (/\b20\d{2}20\d{2}\b/u.test(line) || /\d+\.\d+\.\d+\s*%/u.test(line)) {
      add('review', 'suspected-joined-range');
    }
  }
  return findings;
}

export function numberTokens(text) {
  // Review hints only: ordinary edits and versions also change these tokens.
  return text.match(/[+\-−]?[0-9]+(?:[,.][0-9]+)*(?:\s*(?:[%％]|천원|만원|억원|원|개월|일|명|개|회))?|[~〜～–—≤≥<>±]/gu) ?? [];
}

export function compareNumbers(before, after, file) {
  const oldTokens = numberTokens(before), newTokens = numberTokens(after);
  return JSON.stringify(oldTokens) === JSON.stringify(newTokens) ? [] : [{
    file, level: 'review', code: 'numeric-content-changed',
    before: oldTokens, after: newTokens,
  }];
}

async function filesUnder(root, current = root) {
  const found = [];
  for (const item of await readdir(current, {withFileTypes: true})) {
    if (excluded.has(item.name) || item.isSymbolicLink()) continue;
    const target = path.join(current, item.name);
    if (item.isDirectory()) found.push(...await filesUnder(root, target));
    else if (/\.(md|json)$/iu.test(item.name)) found.push(target);
  }
  return found.sort();
}

export async function audit(root, base) {
  const findings = [], baseline = [];
  if (base && (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/u.test(base) || base.includes('..'))) {
    throw new Error('Invalid base revision');
  }
  if (base) execFileSync('git', ['rev-parse', '--verify', `${base}^{commit}`], {cwd: root, stdio: 'pipe'});
  const files = await filesUnder(root);
  for (const file of files) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    let text;
    try { text = new TextDecoder('utf-8', {fatal: true}).decode(await readFile(file)); }
    catch { findings.push({file: relative, level: 'error', code: 'unreadable-utf8'}); continue; }
    findings.push(...inspectText(text, relative));
    if (base) {
      let old;
      try { old = execFileSync('git', ['show', `${base}:${relative}`], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']}); }
      catch { baseline.push({file: relative, status: 'no-baseline'}); continue; }
      try { findings.push(...compareNumbers(new TextDecoder('utf-8', {fatal: true}).decode(old), text, relative)); }
      catch { findings.push({file: relative, level: 'error', code: 'baseline-unreadable-utf8'}); }
    }
  }
  return {status: findings.some(f => f.level === 'error') ? 'fail' : findings.length ? 'review-needed' : 'pass',
    files: files.length, findings, baseline,
    scope: 'Text integrity only. Numeric changes require human review; no fact or document-layout verification.'};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  try {
    let root = fileURLToPath(new URL('../', import.meta.url)), base;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--root' && args[i + 1]) root = path.resolve(args[++i]);
      else if (args[i] === '--base' && args[i + 1]) base = args[++i];
      else throw new Error('Usage: node scripts/check-text-integrity.mjs [--root DIR] [--base REV]');
    }
    const result = await audit(root, base);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.status === 'fail' ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
