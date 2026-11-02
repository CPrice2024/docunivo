import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {renderPage} from '../.prerender/prerender.js';
import {adsenseVerification} from './adsense.mjs';

const pages=JSON.parse(await readFile(new URL('../src/seo-pages.json',import.meta.url),'utf8'));
const config=JSON.parse(await readFile(new URL('../src/site-config.json',import.meta.url),'utf8'));
const template=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const domain=new URL(config.domain).origin;
const verification=adsenseVerification(config.ads.publisherId);
if(!domain.startsWith('https://'))throw new Error('Use an HTTPS public domain in site-config.json.');
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const organization={'@type':'Organization','@id':`${domain}/#organization`,name:'Docunivo',url:`${domain}/`,logo:{'@type':'ImageObject',url:`${domain}/icon-512.png`,width:512,height:512}};
const website={'@type':'WebSite','@id':`${domain}/#website`,name:'Docunivo',url:`${domain}/`,publisher:{'@id':organization['@id']},inLanguage:'en'};

for(const page of pages){
 const url=domain+page.path;
 const graph=[organization,website,{'@type':page.path==='/about/'?'AboutPage':page.path==='/contact/'?'ContactPage':'WebPage','@id':`${url}#webpage`,url,name:page.title,description:page.description,isPartOf:{'@id':website['@id']},inLanguage:'en'}];
 if(page.path!=='/')graph.push({'@type':'BreadcrumbList','@id':`${url}#breadcrumbs`,itemListElement:[{'@type':'ListItem',position:1,name:'Docunivo',item:`${domain}/`},{'@type':'ListItem',position:2,name:page.heading,item:url}]});
 const metadata=[`<link rel="canonical" href="${escape(url)}"/>`,'<meta name="robots" content="index,follow,max-image-preview:large"/>','<meta property="og:type" content="website"/>','<meta property="og:site_name" content="Docunivo"/>'];
 if(verification.meta)metadata.push(verification.meta);
 for(const [key,value] of Object.entries({title:page.title,description:page.description,url,image:`${domain}/social-preview.png`}))metadata.push(`<meta property="og:${key}" content="${escape(value)}"/>`);
 metadata.push('<meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>','<meta property="og:image:alt" content="Docunivo - browser document and image tools"/>','<meta name="twitter:card" content="summary_large_image"/>');
 for(const [key,value] of Object.entries({title:page.title,description:page.description,image:`${domain}/social-preview.png`,'image:alt':'Docunivo - browser document and image tools'}))metadata.push(`<meta name="twitter:${key}" content="${escape(value)}"/>`);
 metadata.push(`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`);
 const directory=new URL(`../dist${page.path}`,import.meta.url);
 await mkdir(directory,{recursive:true});
 const html=template.replace(/<title>.*?<\/title>/,()=>`<title>${escape(page.title)}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/?\s*>/,()=>`<meta name="description" content="${escape(page.description)}"/>`)
  .replace('</head>',`${metadata.join('\n')}\n</head>`)
  .replace('<div id="root"></div>',()=>`<div id="root">${renderPage(page.path)}</div>`);
 await writeFile(new URL('index.html',directory),html);
}
await writeFile(new URL('../dist/sitemap.xml',import.meta.url),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page=>`<url><loc>${escape(domain+page.path)}</loc></url>`).join('')}</urlset>`);
await writeFile(new URL('../dist/robots.txt',import.meta.url),`User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`);
if(verification.adsTxt)await writeFile(new URL('../dist/ads.txt',import.meta.url),verification.adsTxt);
console.log(`Generated ${pages.length} pages with readable HTML, metadata and structured data.`);
