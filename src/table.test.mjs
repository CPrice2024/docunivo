import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectTable} from './table.ts';

const word = (text, x, y, width = 30) => ({text, bbox:{x0:x,y0:y,x1:x+width,y1:y+10}});
test('reconstructs columns across OCR reading order and preserves missing cells', () => {
  const words = [word('Item',0,0),word('Qty',150,0),word('Price',250,0),
    word('Red',0,30),word('apple',38,30),word('2',150,30),word('5',250,30),
    word('Pear',0,60),word('8',250,60)];
  assert.deepEqual(detectTable(words.reverse()), [
    ['Item','Qty','Price'],['Red apple','2','5'],['Pear','','8']]);
});
test('ordinary word spaces do not create table columns', () => {
  assert.deepEqual(detectTable([word('Hello',0,0),word('world',36,0),word('Next',0,30)]),
    [['Hello world'],['Next']]);
});
test('empty and invalid OCR boxes are ignored', () => {
  assert.deepEqual(detectTable([]), []);
  assert.deepEqual(detectTable([word('',0,0),word('bad',NaN,0)]), []);
});
