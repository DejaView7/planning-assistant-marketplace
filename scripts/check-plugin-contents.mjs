import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';

const manifests = new Set(['plugin.json', '.codex-plugin/plugin.json']);
const rootDocs = new Set(['README.md', 'LICENSE', 'LICENSE.md', 'NOTICE', 'NOTICE.md']);
const executable = /\.(?:[cm]?js|jsx|ts|tsx|py|pyc|ps1|psm1|bat|cmd|exe|dll|so|dylib|sh|bash|wasm|jar|vbs|com|scr)$/i;
const forbiddenDirs = new Set(['runtime', 'server', 'node_modules', '.git']);
const mcpKeys = new Set(['mcp', 'mcpservers', 'mcpconfig']);
const executionKeys = new Set(['requireslocalexecutor', 'hooks', 'hooksfile', 'commands', 'agents', 'entrypoint', 'command', 'args', 'env']);
const keyName = key => key.replace(/[_-]/g, '').toLowerCase();

function allowedFile(file) {
  return manifests.has(file) || rootDocs.has(file)
    || /^skills\/[a-z0-9-]+\/SKILL\.md$/.test(file)
    || /^skills\/[a-z0-9-]+\/references\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.md$/.test(file)
    || /^assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:png|jpe?g|webp|gif|ico)$/.test(file);
}

// Checks this repository's skills-only package policy, not the trustworthiness of prose/assets.
// Unknown files and symlinks fail closed; never follow links into another directory.
export async function inspectPluginContents(root) {
  const issues = [], files = [], runtimeFiles = [], mcpLocations = [];
  const inspectConfig = (value, location) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      const loc = `${location}.${key}`, normalized = keyName(key);
      if (mcpKeys.has(normalized)) {
        mcpLocations.push(loc); issues.push(`MCP setting: ${loc}`);
      }
      if (executionKeys.has(normalized)) {
        runtimeFiles.push(loc); issues.push(`Execution setting: ${loc}`);
      }
      inspectConfig(child, loc);
    }
  };
  const walk = async (dir, prefix = '') => {
    for (const entry of await readdir(dir, {withFileTypes: true})) {
      const relative = prefix + entry.name, target = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) { issues.push(`Symlink: ${relative}`); continue; }
      if (entry.isDirectory()) {
        if (forbiddenDirs.has(entry.name.toLowerCase())) issues.push(`Forbidden directory: ${relative}`);
        await walk(target, relative + '/'); continue;
      }
      if (!entry.isFile()) { issues.push(`Unsupported entry: ${relative}`); continue; }
      files.push(relative);
      if (executable.test(entry.name)) { runtimeFiles.push(relative); issues.push(`Executable file: ${relative}`); }
      if (/^\.?mcp\.json$/i.test(entry.name)) { mcpLocations.push(relative); issues.push(`MCP config: ${relative}`); }
      if (!allowedFile(relative)) issues.push(`Unexpected file: ${relative}`);
      if (manifests.has(relative)) inspectConfig(JSON.parse(await readFile(target, 'utf8')), relative);
    }
  };
  await walk(root);
  return {issues, files: files.sort(), runtimeFiles, mcpLocations,
    bundledRuntime: runtimeFiles.length > 0, mcp: mcpLocations.length > 0};
}
