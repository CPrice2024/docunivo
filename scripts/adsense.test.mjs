import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adsenseVerification} from './adsense.mjs';

test('an unconfigured AdSense account emits no verification or seller record',()=>{
 assert.deepEqual(adsenseVerification(),{meta:'',adsTxt:''});
});
test('verification generates matching public account identifiers without loading ad scripts',()=>{
 const result=adsenseVerification('ca-pub-1234567890123456');
 assert.equal(result.meta,'<meta name="google-adsense-account" content="ca-pub-1234567890123456"/>');
 assert.equal(result.adsTxt,'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
 assert.ok(!result.meta.includes('<script'));
});
test('invalid publisher identifiers cannot be published',()=>{
 for(const value of ['pub-1234567890123456','ca-pub-123','ca-pub-1234567890123456"/><script>'])assert.throws(()=>adsenseVerification(value));
});
