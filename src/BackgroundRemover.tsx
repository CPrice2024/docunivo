import {useLanguage} from './Language';
import {useEffect,useRef,useState} from 'react';
import {FileImage,UploadCloud} from 'lucide-react';

export default function BackgroundRemover(){
 const {t}=useLanguage();
  const [file,setFile]=useState<File|null>(null),[original,setOriginal]=useState(''),[result,setResult]=useState('');
  const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState(''),[background,setBackground]=useState('checker');
  const worker=useRef<Worker|null>(null),locked=useRef(false),input=useRef<HTMLInputElement|null>(null);
  useEffect(()=>()=>{if(original)URL.revokeObjectURL(original);},[original]);
  useEffect(()=>()=>{if(result)URL.revokeObjectURL(result);},[result]);
  useEffect(()=>()=>{worker.current?.terminate();},[]);
  const choose=(selected?:File)=>{
    if(!selected||locked.current)return;
    if(!['image/png','image/jpeg','image/webp'].includes(selected.type)){setError('Choose a PNG, JPG or WEBP image.');return;}
    if(selected.size>12*1024*1024){setError('Maximum image size is 12 MB.');return;}
    setFile(selected);setOriginal(URL.createObjectURL(selected));setResult('');setError('');setStatus('Ready to remove background.');
  };
  const cancel=()=>{worker.current?.terminate();worker.current=null;locked.current=false;setBusy(false);setStatus('Cancelled. You can try again.');};
  const remove=()=>{
    if(!file||locked.current)return;
    locked.current=true;setBusy(true);setResult('');setError('');setStatus('Starting background removal...');
    try{
      const current=new Worker(new URL('./background.worker.ts',import.meta.url),{type:'module'});worker.current=current;
      const finish=()=>{current.terminate();if(worker.current===current)worker.current=null;locked.current=false;setBusy(false);};
      current.onmessage=(event:MessageEvent)=>{
        if(worker.current!==current)return;
        const data=event.data;
        if(data.type==='status')setStatus(data.message);
        else if(data.type==='done'){setResult(URL.createObjectURL(data.blob));setStatus(`Background removed — ${data.width} × ${data.height} PNG. Check the edges before downloading.`);finish();}
        else if(data.type==='error'){setError(data.message+' Check your connection and try a smaller image if needed.');setStatus('Background removal failed.');finish();}
      };
      current.onerror=()=>{if(worker.current!==current)return;setError('The processing worker failed. Refresh or try a smaller image in a current browser.');setStatus('Background removal failed.');finish();};
      current.postMessage({file});
    }catch(error){worker.current?.terminate();worker.current=null;locked.current=false;setBusy(false);setError(error instanceof Error?error.message:'Could not start background removal.');}
  };
  return <section className="background-tool"><div className="section-head"><div><h2>{t("Background Remover")}</h2><p>PNG, JPG and WEBP · Max 12 MB · Transparent PNG output</p></div></div>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden disabled={busy} onChange={event=>{choose(event.target.files?.[0]);event.target.value='';}}/>
    <div className="dropzone" role="button" aria-label="Upload an image for background removal" aria-disabled={busy} tabIndex={busy?-1:0} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();choose(event.dataTransfer.files[0]);}} onClick={()=>{if(!locked.current)input.current?.click();}} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!locked.current)input.current?.click();}}}>
      <div className="upload-icon"><UploadCloud size={31}/></div><strong>{t("Click to upload or drag and drop")}</strong><p>{t("Your image stays in your browser")}</p><span className="browse">{t("Browse image")}</span>
    </div>
    {file&&<div className="selected"><FileImage size={17}/><span title={file.name}>{file.name}</span><button disabled={busy} onClick={()=>input.current?.click()}>{t("Change")}</button></div>}
    <div className="background-previews"><figure><figcaption>{t("Original")}</figcaption><div className="cutout-preview">{original?<img src={original} alt="Original uploaded image"/>:<p>Choose an image to begin.</p>}</div></figure><figure><figcaption>{t("Background removed")}</figcaption><div className={`cutout-preview ${background==='checker'?'checker':''}`} style={background==='checker'?undefined:{backgroundColor:background}}>{result?<img src={result} alt="Image with its background removed"/>:<p>Your cutout will appear here.</p>}</div></figure></div>
    <label className="preview-color">{t("Preview background")}<select value={background} onChange={event=>setBackground(event.target.value)}><option value="checker">{t("Transparency checkerboard")}</option><option value="#ffffff">{t("White")}</option><option value="#18243c">{t("Dark")}</option><option value="#4f76ff">{t("Blue")}</option></select></label>
    <p className="notice">Preview colors are for inspection only. The downloaded PNG keeps its transparency.</p>
    <button className="primary" disabled={!file||busy} onClick={remove}>{t(busy?'Removing background...':'Remove background')}</button>
    {busy&&<button className="receipt-add" onClick={cancel}>{t("Cancel")}</button>}
    <p role="status" className="table-summary">{status}</p>{error&&<div className="error" role="alert">{error}</div>}
    <div className="result-actions"><button disabled={!result||busy} onClick={()=>{if(!result)return;const anchor=document.createElement('a');anchor.href=result;anchor.download=(file?.name.replace(/\.[^.]+$/,'')||'doculens')+'-no-background.png';anchor.click();}}>{t("Download transparent PNG")}</button></div>
    <p className="notice">Processing happens in your browser. First use downloads an AI model and runtime files from external hosts; your selected image is not uploaded. Large images are resized to a maximum edge of 2048 pixels. Fine hair, transparent objects and complex scenes may need further editing.</p>
  </section>;
}
