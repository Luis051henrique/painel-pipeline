import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Monta o objeto version.json a partir das variáveis do GitHub Actions.
export function makeVersion(env = process.env) {
  let gates = {};
  try {
    const needs = JSON.parse(env.GATES || '{}');
    gates = Object.fromEntries(Object.entries(needs).map(([k, v]) => [k, v.result ?? String(v)]));
  } catch {
    // build local: sem resultado de gates
  }
  const sha = env.GITHUB_SHA || 'local';
  return {
    sha,
    short: sha.slice(0, 7),
    build: env.GITHUB_RUN_NUMBER || '0',
    branch: env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || 'local',
    actor: env.GITHUB_ACTOR || 'local',
    env: env.DEPLOY_ENV || 'local',
    builtAt: new Date().toISOString(),
    gates,
  };
}

async function main() {
  await rm('dist', { recursive: true, force: true });
  await mkdir('dist', { recursive: true });
  await cp('src', 'dist', { recursive: true });
  await cp('public', 'dist', { recursive: true });
  await writeFile('dist/version.json', JSON.stringify(makeVersion(), null, 2));
  console.log('build ok -> dist/');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
