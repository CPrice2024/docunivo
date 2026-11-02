import test from 'node:test';
import assert from 'node:assert/strict';
import {languages,supportedLanguage,suggestedLanguage,translations} from './languages.ts';

test('regional browser locales resolve to supported interface languages',()=>{
 assert.equal(supportedLanguage('fr-CA'),'fr');
 assert.equal(supportedLanguage('HI_in'),'hi');
 assert.equal(supportedLanguage('sw-KE'),undefined);
 assert.equal(supportedLanguage(null),undefined);
 assert.equal(supportedLanguage('de-DE'),undefined);
});
test('suggestions respect browser preference order and fall back to English',()=>{
 assert.equal(suggestedLanguage(['de-DE','es-MX','fr']),'es');
 assert.equal(suggestedLanguage(['en-GB','fr']),'en');
 assert.equal(suggestedLanguage(['ja-JP']),'en');
 assert.equal(suggestedLanguage([]),'en');
});
test('every non-English locale translates the same core interface keys',()=>{
 const keys=Object.keys(translations.hi).sort();
 for(const language of languages.filter(item=>item.code!=='en')){
  assert.deepEqual(Object.keys(translations[language.code]).sort(),keys);
  for(const value of Object.values(translations[language.code]))assert.ok(value.trim());
 }
 assert.equal(languages.find(item=>item.code==='hi').ocr,'hin');
 assert.equal(languages.find(item=>item.code==='fr').ocr,'fra');
});
