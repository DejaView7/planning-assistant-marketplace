import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {inspectText, compareNumbers, audit} from '../scripts/check-text-integrity.mjs';

test('valid Korean, CRLF, ranges, versions and tabs are preserved', () => {
  assert.deepEqual(inspectText('한글\t안내\r\n3~5%, 2026~2027년, v0.2.5', 'a.md'), []);
});
test('broken characters and null bytes are errors with line locations', () => {
  const result = inspectText('정상\n깨짐\ufffd\n제어\x00', 'a.md');
  assert.deepEqual(result.map(x => [x.line, x.level]), [[2, 'error'], [3, 'error']]);
});
test('personal paths on Windows and Unix are detected', () => {
  for (const text of ['C:\\Users\\someone\\file', 'C:/Users/someone/file', '/Users/person/file', '/home/person/file']) {
    assert.equal(inspectText(text, 'a.md')[0]?.code, 'personal-path');
  }
  assert.deepEqual(inspectText('https://example.org/help /tmp/report.md', 'a.md'), []);
});
test('suspected joined ranges request review, not automatic correction', () => {
  assert.equal(inspectText('20262027 / 9.7510.5%', 'a.md')[0].level, 'review');
  assert.deepEqual(inspectText('35%', 'a.md'), []);
  assert.equal(compareNumbers('3~5%', '35%', 'a.md')[0].code, 'numeric-content-changed');
});
test('numbers and units change while prose-only edits do not', () => {
  assert.equal(compareNumbers('10만원', '10천원', 'a.md').length, 1);
  assert.equal(compareNumbers('예산은 10만원', '예산: 10만원', 'a.md').length, 0);
  assert.equal(compareNumbers('-10%', '10%', 'a.md').length, 1);
  assert.equal(compareNumbers('≤10%', '≥10%', 'a.md').length, 1);
});
test('malformed UTF-8 cannot silently pass', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'jarvis-integrity-'));
  try {
    await writeFile(path.join(root, 'bad.md'), Buffer.from([0xc3, 0x28]));
    const report = await audit(root);
    assert.equal(report.status, 'fail');
    assert.equal(report.findings[0].code, 'unreadable-utf8');
  } finally { await rm(root, {recursive: true, force: true}); }
});

test('decrease signs, currencies and physical units cannot silently change', () => {
  for (const [before, after] of [
    ['△10%', '10%'], ['▲10%', '10%'], ['－10%', '10%'],
    ['1kg', '1g'], ['1m²', '1m³'], ['1m^2', '1m^3'], ['1kg/개월', '1kg/년'],
    ['10달러', '10유로'], ['USD 10', 'EUR 10'], ['$10', '€10'],
    ['−$10', '$10'], ['USD −10', 'USD 10'],
    ['10백만원', '10만원'], ['1kWh', '1MWh'], ['5%p', '5%'],
  ]) assert.equal(compareNumbers(before, after, 'a.md').length, 1, `${before} -> ${after}`);
});

test('unit spacing and surrounding prose do not invent numeric changes', () => {
  for (const [before, after] of [
    ['중량은 1 kg이다', '중량: 1kg이다'], ['USD 10', 'USD10'],
    ['△ 10 %', '△10%'], ['기간 3개월', '기간은 3개월'],
    ['10만원\n안내', '10만원\n변경 안내'],
  ]) assert.deepEqual(compareNumbers(before, after, 'a.md'), [], `${before} -> ${after}`);
});
