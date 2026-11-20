import test from 'node:test';
import assert from 'node:assert/strict';
import { makeVersion } from '../scripts/build.mjs';

test('abrevia o SHA e lê o resultado dos gates', () => {
  const v = makeVersion({
    GITHUB_SHA: 'abcdef1234567890',
    GATES: JSON.stringify({ quality: { result: 'success' }, sast: { result: 'success' } }),
  });
  assert.equal(v.short, 'abcdef1');
  assert.equal(v.gates.quality, 'success');
  assert.equal(v.gates.sast, 'success');
});

test('build local usa valores padrão', () => {
  const v = makeVersion({});
  assert.equal(v.sha, 'local');
  assert.equal(v.env, 'local');
  assert.deepEqual(v.gates, {});
});
