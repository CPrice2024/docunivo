import {test} from 'node:test';
import assert from 'node:assert/strict';
import {repairTable,toCsv} from './table-tools.ts';
test('split pads shorter rows and preserves empty cells',()=>{
  const original=[['Red|apple','2'],['Pear','3'],['|Orange','4']];
  assert.deepEqual(repairTable(original,'split-column',0,0,'|'),[['Red','apple','2'],['Pear','','3'],['','Orange','4']]);
  assert.equal(original[0][0],'Red|apple');
});
test('merge preserves adjacent columns and blank values',()=>{
  assert.deepEqual(repairTable([['a','','c'],['d','e','f']],'merge-right',0,0),[['a','c'],['d e','f']]);
});
test('insert and delete maintain rectangular shape',()=>{
  const rows=repairTable([['a','b']],'insert-row',0,0);
  assert.deepEqual(rows,[['a','b'],['','']]);
  const columns=repairTable(rows,'insert-column',0,0);
  assert.deepEqual(columns,[['a','','b'],['','','']]);
  assert.deepEqual(repairTable(columns,'delete-column',0,1),rows);
  assert.deepEqual(repairTable(rows,'delete-row',0,0),[['','']]);
});
test('last row and column cannot be deleted and invalid selections are safe',()=>{
  const table=[['a']];
  assert.deepEqual(repairTable(table,'delete-column',0,0),table);
  assert.deepEqual(repairTable(table,'delete-row',0,0),table);
  assert.deepEqual(repairTable(table,'merge-right',0,0),table);
  assert.deepEqual(repairTable(table,'insert-row',4,0),table);
});
test('CSV escapes commas quotes newlines and spreadsheet formulas',()=>{
  assert.equal(toCsv([['a,b','say "hi"','line\nbreak','','=1+1',' @SUM(A1)']]),'\uFEFF"a,b","say ""hi""","line\nbreak","","\'=1+1","\' @SUM(A1)"');
});
