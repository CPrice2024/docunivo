import {mkdir,readFile,writeFile} from 'node:fs/promises';

const pages=[
  ['about','About Docunivo','About the browser-based document and image toolkit.'],
  ['privacy','Privacy policy','How Docunivo processes files and handles advertising.'],
  ['terms','Terms of use','Terms and limitations for using Docunivo tools.'],
  ['contact','Contact','Contact and support information for Docunivo.'],
  ['image-to-text','Image to Text','Extract and edit text from images in your browser.'],
  ['image-to-excel','Image to Excel','Convert image tables into editable cells and download a spreadsheet.'],
  ['receipt-to-csv','Receipt to CSV','Review receipt items and totals and export them as CSV.'],
  ['pdf-ocr','PDF OCR','Recognize and edit text from scanned PDF pages in your browser.'],
  ['background-remover','Background Remover','Remove image backgrounds locally and download a transparent PNG.'],
];
const template=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const config=JSON.parse(await readFile(new URL('../src/site-config.json',import.meta.url),'utf8'));
const domain=config.domain?new URL(config.domain).origin:'';
if(domain&&!domain.startsWith('https://'))throw new Error('Use an HTTPS public domain in site-config.json.');
for(const [slug,title,description] of pages){
  const directory=new URL(`../dist/${slug}/`,import.meta.url);
  await mkdir(directory,{recursive:true});
  await writeFile(new URL('index.html',directory),template
    .replace(/<title>.*?<\/title>/,`<title>${title} | Docunivo</title>`)
    .replace(/(<meta name="description" content=")[^"]*/,`$1${description}`)
    .replace('</head>',domain?`<link rel="canonical" href="${domain}/${slug}/"/></head>`:'</head>'));
}
if(domain){
  await writeFile(new URL('../dist/index.html',import.meta.url),template.replace('</head>',`<link rel="canonical" href="${domain}/"/></head>`));
  const urls=['/',...pages.map(([slug])=>`/${slug}/`)];
  await writeFile(new URL('../dist/sitemap.xml',import.meta.url),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(path=>`<url><loc>${domain}${path}</loc></url>`).join('')}</urlset>`);
}
await writeFile(new URL('../dist/robots.txt',import.meta.url),`User-agent: *\nAllow: /\n${domain?`Sitemap: ${domain}/sitemap.xml\n`:''}`);
if(/^ca-pub-\d{16}$/.test(config.ads.publisherId)){
  await writeFile(new URL('../dist/ads.txt',import.meta.url),`google.com, ${config.ads.publisherId.replace('ca-','')}, DIRECT, f08c47fec0942fa0\n`);
}
