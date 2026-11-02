import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessQuality} from './quality.ts';
test('empty OCR cannot be exported as a successful result', () => {
  assert.equal(assessQuality(' \n', []).level, 'empty');
});
test('low-confidence pattern noise is flagged', () => {
  assert.equal(assessQuality('SR SR NEN $e', [{text:'SR SR NEN $e', confidence:22}]).level, 'low');
  assert.equal(assessQuality('| / % ~ : 8', [{text:'8', confidence:90}]).level, 'low');
});
test('missing and invalid confidence require review', () => {
  assert.equal(assessQuality('Invoice', []).level, 'review');
  assert.equal(assessQuality('Invoice', [{text:'Invoice',confidence:NaN}]).confidence, null);
});
test('clear short text and numeric tables are not rejected just for length', () => {
  assert.equal(assessQuality('PLAY NOW', [{text:'PLAY NOW',confidence:90}]).level, 'normal');
  assert.equal(assessQuality('123 4.50', [{text:'123 4.50',confidence:90}]).level, 'normal');
});
test('long low-confidence tokens outweigh isolated confident letters', () => {
  assert.equal(assessQuality('a unreadable', [{text:'a',confidence:100},{text:'unreadable',confidence:10}]).level,'low');
});
