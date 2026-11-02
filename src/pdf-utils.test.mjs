import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectedPages,renderScale} from './pdf-utils.ts';
test('page selection uses inclusive one-based ranges and enforces limits',()=>{
  assert.deepEqual(selectedPages(2,4,5),[2,3,4]);
  for(const values of [[0,2,5],[3,2,5],[1,6,5],[1,21,30],[1.5,2,5],[NaN,2,5]])assert.throws(()=>selectedPages(...values));
});
test('render scale bounds high-resolution and oversized pages',()=>{
  for(const [width,height] of [[612,792],[10000,10000],[100000,10]]){
    const scale=renderScale(width,height);
    assert.ok(width*height*scale*scale<=4_000_001);assert.ok(width*scale<=4096);assert.ok(height*scale<=4096);
  }
  assert.throws(()=>renderScale(0,20));
});
