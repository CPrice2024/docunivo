import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const pages=JSON.parse(await readFile(new URL('../src/seo-pages.json',import.meta.url),'utf8'));
const domain='https://docunivo.online';
const decode=value=>value.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"');
test('all public pages have unique metadata, readable HTML and consistent structured data',async()=>{
 const titles=new Set(),descriptions=new Set();
 for(const page of pages){
  const html=await readFile(new URL(`../dist${page.path}index.html`,import.meta.url),'utf8');
  const title=decode(html.match(/<title>(.*?)<\/title>/)[1]);
  const description=decode(html.match(/<meta name="description" content="([^"]*)"/)[1]);
  assert.equal(title,page.title);assert.equal(description,page.description);
  assert.ok(!titles.has(title));assert.ok(!descriptions.has(description));titles.add(title);descriptions.add(description);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.ok(html.includes(`rel="canonical" href="${domain}${page.path}"`));
  assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
  assert.ok(html.includes(page.heading));
  assert.ok(html.includes('href="/"'));
  if(page.intro)assert.ok(html.includes('class="related-tools"'));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  const data=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(data['@graph'].find(item=>item['@id']===`${domain}${page.path}#webpage`).name,title);
  assert.ok(!html.includes('aggregateRating'));assert.ok(!html.includes('noindex'));
 }
});
test('sitemap, robots and brand assets are included in the production build',async()=>{
 const sitemap=await readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');
 for(const page of pages)assert.ok(sitemap.includes(`<loc>${domain}${page.path}</loc>`));
 assert.equal((sitemap.match(/<loc>/g)||[]).length,pages.length);
 const robots=await readFile(new URL('../dist/robots.txt',import.meta.url),'utf8');
 assert.ok(robots.includes(`Sitemap: ${domain}/sitemap.xml`));
 for(const name of ['favicon.svg','favicon-48.png','apple-touch-icon.png','icon-192.png','icon-512.png','social-preview.png','site.webmanifest']){
  const asset=await readFile(new URL(`../dist/${name}`,import.meta.url));assert.ok(asset.length>0);
  if(name.endsWith('.png'))assert.deepEqual([...asset.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 }
});
