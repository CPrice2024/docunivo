import {Brand,SocialLinks} from './Brand';
import {useLanguage,LanguageProvider,LanguageSelector,DocumentLanguage} from './Language';
import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import {createRoot} from 'react-dom/client';
import {createWorker} from 'tesseract.js';
import {ScanText, FileImage, FileSpreadsheet, Download, ShieldCheck, UploadCloud, Copy, Check, RefreshCw, Sparkles, ArrowRight, AlertCircle} from 'lucide-react';
import './style.css';
import {AdSlot} from './AdSlot';
import {InformationPage,informationPages,ToolGuide} from './PageContent';
import {detectTable} from './table';
import {ImageEditor} from './ImageEditor';
import {TableEditor} from './TableEditor';
import {toCsv} from './table-tools';
import {parseReceipt,receiptRows,type Receipt} from './receipt';
import {ReceiptEditor} from './ReceiptEditor';
import {assessQuality, type Quality} from './quality';

const PdfTool=lazy(()=>import('./PdfTool'));
const BackgroundRemover=lazy(()=>import('./BackgroundRemover'));
type Tool = 'text' | 'spreadsheet' | 'receipt' | 'pdf' | 'background';
const TOOLS: {id:Tool;title:string;description:string;icon:typeof ScanText;beta?:boolean}[] = [
 {id:'text',title:'Image to Text',description:'Extract and edit text',icon:FileImage},
 {id:'spreadsheet',title:'Image to Excel',description:'Turn tables into cells',icon:FileSpreadsheet,beta:true},
 {id:'receipt',title:'Receipt to CSV',description:'Organize items and totals',icon:FileSpreadsheet,beta:true},
 {id:'pdf',title:'PDF OCR',description:'Read scanned PDF pages',icon:ScanText,beta:true},
 {id:'background',title:'Background Remover',description:'Create a transparent cutout',icon:Sparkles},
];
const TOOL_PATHS: Record<Tool,string> = {text:'/image-to-text/',spreadsheet:'/image-to-excel/',receipt:'/receipt-to-csv/',pdf:'/pdf-ocr/',background:'/background-remover/'};
const pagePath=window.location.pathname.replace(/\/index\.html$/,'/').replace(/\/?$/,'/');
const pageTool=TOOLS.find(item=>TOOL_PATHS[item.id]===pagePath)??(pagePath==='/'?TOOLS[0]:undefined);
const isHome=pagePath==='/';
const informationTitle=informationPages[pagePath];
const MAX_BYTES = 12 * 1024 * 1024;
function getRows(text:string) {
  // Heuristic only: split tab-separated text, or runs of 2+ spaces. Original table geometry is not retained.
  return text.split(/\r?\n/).filter(x=>x.trim()).map(line=>line.includes('\t')?line.split('\t'):line.split(/\s{2,}/)).map(row=>row.map(x=>x.trim()));
}
function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function App(){
 const {t}=useLanguage();
 const [ocrLanguage,setOcrLanguage]=useState('eng');
 const [receipt,setReceipt]=useState<Receipt|null>(null);
 const [receiptReviewed,setReceiptReviewed]=useState(false);
 const [quality,setQuality]=useState<Quality|null>(null);
 const [reviewed,setReviewed]=useState(false);
 const [prepared,setPrepared]=useState<Blob|null>(null);
 const [editing,setEditing]=useState(false);
 const processing=useRef(false);
 const mounted=useRef(true);
 const [table,setTable]=useState<string[][]>([]);
 const tool:Tool=pageTool?.id??'text'; const [file,setFile]=useState<File|null>(null); const [preview,setPreview]=useState('');const [output,setOutput]=useState(''); const [busy,setBusy]=useState(false); const [progress,setProgress]=useState(0);const [error,setError]=useState(''); const [copied,setCopied]=useState(false);const input=useRef<HTMLInputElement>(null);const worker=useRef<Awaited<ReturnType<typeof createWorker>>|null>(null);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;const current=worker.current;worker.current=null;void current?.terminate().catch(()=>{})}},[]);
 const activeTool=TOOLS.find(item=>item.id===tool)!;
 useEffect(()=>{
  document.title=informationTitle?informationTitle+' | Docunivo':isHome?'Docunivo ? Free document and image tools':pageTool?activeTool.title+' | Docunivo':'Page not found | Docunivo';
  document.querySelector('meta[name="description"]')?.setAttribute('content',informationTitle?informationTitle+' for Docunivo.':isHome?'Extract text, convert image tables, organize receipts, read scanned PDFs and remove backgrounds in your browser.':activeTool.description+'. Process files locally in your browser with Docunivo.');
 },[]);
 const resultText=tool==='receipt'?(receipt?receiptRows(receipt).map(row=>row.join('\t')).join('\n'):''):tool==='spreadsheet'?table.map(row=>row.join('\t')).join('\n'):output;
 const needsReview=quality?.level==='low'||quality?.level==='review';
 const exportBlocked=busy||editing||(tool==='receipt'&&(!receiptReviewed||!receipt))||quality?.level==='empty'||(needsReview&&!reviewed);
 const chooseFile=(f?:File)=>{if(!f||processing.current||editing)return;setError('');if(!['image/png','image/jpeg','image/webp','image/bmp'].includes(f.type)){setError('Please use a PNG, JPG, WEBP or BMP image.');return}if(f.size>MAX_BYTES){setError('Maximum image size is 12 MB.');return}setFile(f);setPrepared(null);setPreview(URL.createObjectURL(f));setOutput('');setTable([]);setReceipt(null);setReceiptReviewed(false);setCopied(false);setQuality(null);setReviewed(false);setProgress(0)};
 const applyImage=(blob:Blob)=>{setPrepared(blob);setPreview(URL.createObjectURL(blob));setOutput('');setTable([]);setReceipt(null);setReceiptReviewed(false);setQuality(null);setReviewed(false);setCopied(false);setProgress(0);setError('')};
 const recognize=async()=>{
  if(!file||processing.current||editing)return;
  processing.current=true;setError('');setBusy(true);setProgress(0);setOutput('');setTable([]);setReceipt(null);setReceiptReviewed(false);setCopied(false);setQuality(null);setReviewed(false);
  let current:Awaited<ReturnType<typeof createWorker>>|null=null;
  try{
   current=await createWorker(tool==='receipt'?'eng':ocrLanguage,1,{logger:m=>{if(mounted.current&&m.status==='recognizing text'&&typeof m.progress==='number')setProgress(Math.round(m.progress*100))}});
   if(!mounted.current)return;
   worker.current=current;
   const result=await current.recognize(prepared??file, {}, {text:true, blocks:true});
   if(!mounted.current)return;
   const words=(result.data.blocks??[]).flatMap(b=>b.paragraphs.flatMap(p=>p.lines.flatMap(l=>l.words)));
   setReceipt(parseReceipt(result.data.text));setQuality(assessQuality(result.data.text,words));setTable(detectTable(words));setOutput(result.data.text.trim());setProgress(100);

  }catch(e){if(mounted.current)setError(e instanceof Error?e.message:'Recognition failed. Check your internet connection for the first model download.')}
  finally{
   // Release the worker even when initialization finishes after unmount.
   if(current&&(worker.current===current||!mounted.current)){
    if(worker.current===current)worker.current=null;
    try{await current.terminate()}catch{/* Cleanup must not reject the click handler. */}
   }
   processing.current=false;if(mounted.current)setBusy(false);
  }
 };
 const saveExcel=async()=>{if(exportBlocked)return;try{const XLSX=await import('xlsx');const rows=tool==='receipt'&&receipt?receiptRows(receipt):tool==='spreadsheet'?table:getRows(output);const ws=XLSX.utils.aoa_to_sheet(rows.length?rows:[['']]);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Extracted');XLSX.writeFile(wb,'doculens-extracted.xlsx')}catch(e){setError(e instanceof Error?e.message:'Spreadsheet export failed. Please try again.')}};
 const copy=async()=>{if(exportBlocked)return;try{await navigator.clipboard.writeText(resultText);setCopied(true);setTimeout(()=>setCopied(false),2000)}catch{setError('Clipboard access was denied; select and copy the text manually.')}};
 return <div className="app"><a className="skip-link" href="#main-content">{t("Skip to content")}</a><header className="nav container"><Brand/><nav><a href="/#tools">{t("Tools")}</a><a href="#how">{t("How it works")}</a><a href="#faq">{t("FAQ")}</a></nav><LanguageSelector/><span className="nav-pill"><ShieldCheck size={15}/> {t("Files stay on your device")}</span></header>
 <main id="main-content">{informationTitle?<InformationPage path={pagePath}/>:<>{!pageTool&&<section className="information container"><h1>Page not found</h1><p>Choose a tool below to continue.</p></section>}
 <section id="tools" className="workspace container"><nav className="tool-tabs" aria-label="Choose a tool">{TOOLS.map(item=><a key={item.id} href={TOOL_PATHS[item.id]} aria-current={pageTool?.id===item.id?'page':undefined} className={pageTool?.id===item.id?'tab active':'tab'}><span className="tool-icon"><item.icon size={20}/></span><span className="tool-copy"><span className="tool-name">{t(item.title)}{item.beta&&<span className="beta">BETA</span>}</span><span className="tool-description">{t(item.description)}</span></span></a>)}</nav>
 {pageTool&&<> <div id="tool-panel" role="region" aria-labelledby="active-tool-title"><div className="workspace-heading"><div><h1 id="active-tool-title">{t(activeTool.title)}</h1></div><span className="local-indicator"><ShieldCheck size={15}/> {t("Processed locally")}</span></div>
 {tool==='background'?<Suspense fallback={<p className="notice">Loading background remover...</p>}><BackgroundRemover/></Suspense>:tool==='pdf'?<Suspense fallback={<p className="notice">Loading PDF tools...</p>}><PdfTool/></Suspense>:<div className="workspace-body"><div className="work-col"><div className="section-head"><div><h2>{t("Upload your image")}</h2><p>Supports PNG, JPG, WEBP and BMP • Max 12 MB</p></div></div><input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/bmp" hidden disabled={busy||editing} onChange={e=>{chooseFile(e.target.files?.[0]);e.target.value=''}}/><div style={preview?{display:'none'}:undefined} className={`dropzone ${file?'has-file':''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();chooseFile(e.dataTransfer.files[0])}} onClick={()=>input.current?.click()} role="button" aria-disabled={busy||editing} tabIndex={busy||editing?-1:0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.current?.click()}}}>{preview?<img src={preview} alt="Selected document preview"/>:<><div className="upload-icon"><UploadCloud size={31}/></div><strong>{t("Click to upload or drag and drop")}</strong><p>{t("Your image stays in your browser")}</p><span className="browse">{t("Browse image")}</span></>}</div>{preview&&<ImageEditor src={preview} disabled={busy} onApply={applyImage} onWorking={setEditing} onError={setError}/>}{file&&<div className="selected"><FileImage size={17}/><span title={file.name}>{file.name}</span><button disabled={busy||editing} onClick={()=>input.current?.click()}>{t("Change")}</button>{prepared&&<button disabled={busy||editing} onClick={()=>{if(file){setPrepared(null);setPreview(URL.createObjectURL(file));setOutput('');setTable([]);setReceipt(null);setReceiptReviewed(false);setQuality(null);setReviewed(false);setCopied(false);setError('');setProgress(0)}}}>{t("Reset original")}</button>}</div>}{tool!=='receipt'&&<DocumentLanguage value={ocrLanguage} onChange={setOcrLanguage} disabled={busy||editing}/>}<button className="primary" disabled={!file||busy||editing} onClick={recognize}>{busy?<><RefreshCw size={18} className="spin"/> {t('Extracting text...')} {progress}%</>:<><ScanText size={18}/> {t("Extract text")} <ArrowRight size={17}/></>}</button>{busy&&<div className="progress"><div style={{width:`${progress}%`}}/></div>}{error&&<div className="error" role="alert"><AlertCircle size={16}/>{error}</div>}</div>
 <div className="work-col result"><div className="section-head"><div><h2>{t("Extracted result")}</h2><p>{t(tool==='receipt'?'Review receipt items and totals':tool==='spreadsheet'?'Review and edit cells before spreadsheet export':'Review and edit the recognized text')}</p></div><span className="status">{t(busy?'Processing':quality?.level==='empty'?'No text':needsReview?'Review needed':output?'Ready':'Waiting for image')}</span></div>{quality&&<div className={`quality quality-${quality.level}`} role="status"><strong>{quality.title}</strong>{quality.confidence!==null&&<span className="quality-score">OCR confidence: {quality.confidence}/100</span>}<p>{quality.advice}</p>{needsReview&&<label><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/> I reviewed the result and want to enable copying and downloads.</label>}</div>}{tool==='receipt'?(receipt?<><ReceiptEditor receipt={receipt} disabled={busy||editing} onChange={value=>{setReceipt(value);setReceiptReviewed(false);setCopied(false)}}/><label className="receipt-confirm"><input type="checkbox" checked={receiptReviewed} onChange={event=>setReceiptReviewed(event.target.checked)}/> I checked the receipt items, totals and unmatched lines against the image.</label></>:<div className="table-preview"><p>Upload a receipt and extract text to review its items and totals.</p></div>):tool==='spreadsheet'?(table.length?<TableEditor table={table} disabled={busy||editing} onChange={next=>{setTable(next);setCopied(false)}}/>:<div className="table-preview"><p>Extract an image to preview detected rows and columns.</p></div>):<textarea disabled={busy||editing} spellCheck={false} value={output} onChange={e=>{setOutput(e.target.value);setCopied(false)}} placeholder={t('Your extracted text will appear here after processing...')} aria-label="Extracted text"/>}<div className="result-actions"><button disabled={!resultText.trim()||exportBlocked} onClick={copy}>{copied?<Check size={16}/>:<Copy size={16}/>} {t(copied?'Copied':'Copy text')}</button><button disabled={!resultText.trim()||exportBlocked} onClick={()=>downloadBlob(new Blob([resultText],{type:'text/plain;charset=utf-8'}),'doculens-text.txt')}><Download size={16}/> {t("Download TXT")}</button>{(tool==='spreadsheet'||tool==='receipt')&&<button disabled={exportBlocked||(tool==='spreadsheet'?!table.length:!receipt)||!resultText.trim()} onClick={()=>{if(!exportBlocked)downloadBlob(new Blob([toCsv(tool==='receipt'&&receipt?receiptRows(receipt):table)],{type:'text/csv;charset=utf-8'}),tool==='receipt'?'doculens-receipt.csv':'doculens-table.csv')}}><Download size={16}/> {t("Download CSV")}</button>}<button className="export" disabled={exportBlocked||(tool==='spreadsheet'?!table.length:!output.trim())} onClick={saveExcel}><FileSpreadsheet size={16}/> {t("Download XLSX")}</button></div><p className="notice">{tool==='receipt'?'Receipt beta: review all detected items and totals. Currency and date are entered manually; CSV includes only reviewed fields, not unmatched lines.':tool==='spreadsheet'?'Beta: Rows and columns are inferred from text positions. Review every cell before export. Skewed scans, merged cells and wrapped text may need correction.':'OCR accuracy depends on image quality, language and typography. Choose the document language before recognition.'}</p></div></div>}</div></>}</section>
 {pageTool&&<ToolGuide tool={tool} title={activeTool.title}/>}<AdSlot placement="content"/>
 <section id="faq" className="faq container"><h2>{t("Frequently asked questions")}</h2><details><summary>Are my images uploaded to your server?</summary><p>No. Image recognition runs in your browser. The OCR engine and language data are downloaded on first use, but the selected image is processed locally.</p></details><details><summary>Does Image to Excel preserve exact tables?</summary><p>The beta detects rows and shared column gaps from OCR word positions and lets you edit cells before export. Exact layouts, merged cells and wrapped text are not guaranteed.</p></details><details><summary>What languages are supported?</summary><p>Image and PDF OCR support English, Hindi, French and Spanish. Select the document language before extraction. Receipt parsing supports English receipts.</p></details></section><AdSlot placement="footer"/></>}</main><footer className="container footer"><div className="footer-brand"><Brand/><p>Turn documents into possibilities.</p></div><nav className="footer-links" aria-label="Site information"><a href="/about/">{t("About")}</a><a href="/privacy/">{t("Privacy")}</a><a href="/terms/">{t("Terms")}</a><a href="/contact/">{t("Contact")}</a></nav><div className="footer-connect"><SocialLinks/><span>{t("Files processed on your device")}</span></div></footer></div>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><LanguageProvider><App/></LanguageProvider></React.StrictMode>);
