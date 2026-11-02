import {useLanguage,DocumentLanguage} from './Language';
import {useEffect,useRef,useState} from 'react';
import {getDocument,GlobalWorkerOptions,type PDFDocumentLoadingTask,type PDFDocumentProxy} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {createWorker} from 'tesseract.js';
import {assessQuality,type Quality} from './quality';
import {selectedPages,renderScale} from './pdf-utils';

GlobalWorkerOptions.workerSrc=workerUrl;
type PageResult={page:number;text:string;quality:Quality;reviewed:boolean};
export default function PdfTool(){
 const {t}=useLanguage();
  const [ocrLanguage,setOcrLanguage]=useState('eng');
  const [name,setName]=useState(''),[count,setCount]=useState(0),[first,setFirst]=useState(1),[last,setLast]=useState(1);
  const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState('');
  const [results,setResults]=useState<PageResult[]>([]),[copied,setCopied]=useState(false);
  const documentRef=useRef<PDFDocumentProxy|null>(null),task=useRef<PDFDocumentLoadingTask|null>(null);
  const worker=useRef<Awaited<ReturnType<typeof createWorker>>|null>(null);
  const cancelled=useRef(false),mounted=useRef(true),locked=useRef(false),canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;cancelled.current=true;void worker.current?.terminate().catch(()=>{});void task.current?.destroy().catch(()=>{});};},[]);
  const choose=async(file?:File)=>{
    if(!file||locked.current)return;
    if(file.size>30*1024*1024){setError('Maximum PDF size is 30 MB.');return;}
    if(!file.name.toLowerCase().endsWith('.pdf')){setError('Choose a PDF file.');return;}
    locked.current=true;setBusy(true);setError('');setResults([]);setCopied(false);if(canvas.current){canvas.current.width=0;canvas.current.height=0;}setCount(0);setName(file.name);setStatus('Opening PDF...');
    try{
      await task.current?.destroy();documentRef.current=null;
      const bytes=new Uint8Array(await file.arrayBuffer());
      if(!mounted.current)return;
      task.current=getDocument({data:bytes});
      const pdf=await task.current.promise;
      if(!mounted.current)return;
      documentRef.current=pdf;setCount(pdf.numPages);setFirst(1);setLast(Math.min(pdf.numPages,20));setStatus(`${pdf.numPages} pages available`);
    }catch(e){if(mounted.current){setError(e instanceof Error?e.message:'Could not open PDF. Encrypted or damaged files may not be supported.');setStatus('Could not open PDF');}}
    finally{locked.current=false;if(mounted.current)setBusy(false);}
  };
  const extract=async()=>{
    if(locked.current||!documentRef.current)return;
    let pages:number[];
    try{pages=selectedPages(first,last,count);}catch(e){setError((e as Error).message);return;}
    locked.current=true;cancelled.current=false;setBusy(true);setResults([]);setCopied(false);setError('');setStatus('Loading English OCR...');
    let current:Awaited<ReturnType<typeof createWorker>>|null=null;
    try{
      current=await createWorker(ocrLanguage);
      if(cancelled.current||!mounted.current)return;
      worker.current=current;
      for(const [index,number] of pages.entries()){
        if(cancelled.current||!mounted.current)break;
        setStatus(`Processing page ${number} (${index+1} of ${pages.length})`);
        const page=await documentRef.current.getPage(number);
        try{
          const base=page.getViewport({scale:1});
          const viewport=page.getViewport({scale:renderScale(base.width,base.height)});
          const target=canvas.current;if(!target)break;
          target.width=Math.ceil(viewport.width);target.height=Math.ceil(viewport.height);
          const context=target.getContext('2d');if(!context)throw new Error('Canvas is unavailable.');
          await page.render({canvas:target,canvasContext:context,viewport}).promise;
          if(cancelled.current||!mounted.current)break;
          const result=await current.recognize(target,{}, {text:true,blocks:true});
          if(cancelled.current||!mounted.current)break;
          const words=(result.data.blocks??[]).flatMap(b=>b.paragraphs.flatMap(p=>p.lines.flatMap(l=>l.words)));
          const quality=assessQuality(result.data.text,words);
          setResults(previous=>[...previous,{page:number,text:result.data.text.trim(),quality,reviewed:false}]);
        }finally{page.cleanup();}
      }
      if(mounted.current)setStatus(cancelled.current?'Cancelled. Completed pages are retained.':'Selected pages processed. Review the results below.');
    }catch(e){if(mounted.current){if(!cancelled.current)setError(e instanceof Error?e.message:'PDF recognition failed.');setStatus(cancelled.current?'Cancelled. Completed pages are retained.':'Processing stopped. Completed pages are retained.');}}
    finally{
      if(current){try{await current.terminate();}catch{}if(worker.current===current)worker.current=null;}
      locked.current=false;if(mounted.current){setBusy(false);if(cancelled.current)setStatus('Cancelled. Completed pages are retained.');}
    }
  };
  const needsReview=results.some(result=>(result.quality.level==='low'||result.quality.level==='review')&&!result.reviewed);
  const text=results.map(result=>`--- Page ${result.page} ---\n${result.text||'[No readable text detected]'}`).join('\n\n');
  const blocked=busy||!results.some(result=>result.text.trim())||needsReview;
  return <section className="pdf-tool"><div className="section-head"><div><h2>{t("Scanned PDF OCR")}</h2><p>PDF up to 30 MB · English · Up to 20 pages per run</p></div></div>
    <DocumentLanguage value={ocrLanguage} onChange={setOcrLanguage} disabled={busy}/><label className="pdf-upload">Choose PDF<input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={event=>{void choose(event.target.files?.[0]);event.target.value='';}}/></label>
    {name&&<p className="table-summary">{name}{count?` — ${count} pages`:''}</p>}
    <fieldset disabled={busy||!count} className="receipt-fields"><legend>Pages to recognize</legend><label>From page<input type="number" min={1} max={count} value={Number.isFinite(first)?first:''} onChange={event=>setFirst(event.target.valueAsNumber)}/></label><label>To page<input type="number" min={Number.isFinite(first)?first:1} max={count} value={Number.isFinite(last)?last:''} onChange={event=>setLast(event.target.valueAsNumber)}/></label></fieldset>
    <button className="primary" disabled={busy||!count} onClick={()=>void extract()}>Extract selected pages</button>
    {busy&&!!count&&<button className="receipt-add" onClick={()=>{cancelled.current=true;setStatus('Cancelling...');void worker.current?.terminate().catch(()=>{});}}>{t("Cancel")}</button>}
    <p role="status" className="table-summary">{status}</p>{error&&<div className="error" role="alert">{error}</div>}
    <details><summary>Last rendered page preview</summary><canvas className="pdf-canvas" ref={canvas}/></details>
    {results.map((result,index)=><article key={result.page} className="pdf-result"><h3>Page {result.page}</h3><div className={`quality quality-${result.quality.level}`}><strong>{result.quality.title}</strong><p>{result.quality.advice}</p>{(result.quality.level==='low'||result.quality.level==='review')&&<label><input type="checkbox" disabled={busy} checked={result.reviewed} onChange={event=>setResults(previous=>previous.map((value,i)=>i===index?{...value,reviewed:event.target.checked}:value))}/> I reviewed this page.</label>}</div><textarea disabled={busy} aria-label={`Page ${result.page} extracted text`} value={result.text} onChange={event=>{setCopied(false);setResults(previous=>previous.map((value,i)=>i===index?{...value,text:event.target.value,reviewed:false}:value));}}/></article>)}
    <div className="result-actions"><button disabled={blocked} onClick={async()=>{try{await navigator.clipboard.writeText(text);setCopied(true);}catch{setError('Clipboard access was denied. Copy text manually.');}}}>{t(copied?'Copied':'Copy all pages')}</button><button disabled={blocked} onClick={()=>{const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='doculens-pdf-text.txt';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>{t("Download TXT")}</button></div>
    <p className="notice">PDF pages are rendered and recognized locally. First use downloads OCR language data. Output is editable text; original PDF layout is not retained. Password-protected files are not supported in this version.</p>
  </section>;
}
