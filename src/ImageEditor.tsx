import {useEffect, useRef, useState} from 'react';

type Crop = {left:number; top:number; width:number; height:number};
export function ImageEditor({src, disabled, onApply, onWorking, onError}: {
  src:string; disabled:boolean; onApply:(blob:Blob)=>void;
  onWorking:(working:boolean)=>void; onError:(message:string)=>void;
}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const start=useRef<{x:number;y:number}|null>(null);
  const [crop,setCrop]=useState<Crop>({left:0,top:0,width:100,height:100});
  const [ready,setReady]=useState(false);
  const [aspect,setAspect]=useState(1);
  const [working,setWorking]=useState(false);
  useEffect(()=>{
    let active=true;setReady(false);setCrop({left:0,top:0,width:100,height:100});
    const image=new Image();
    image.onload=()=>{
      if(!active||!canvas.current)return;
      const target=canvas.current;
      target.width=image.naturalWidth;target.height=image.naturalHeight;
      const context=target.getContext('2d');
      if(!context){onError('Your browser could not open the image editor.');return;}
      context.drawImage(image,0,0);setAspect(image.naturalWidth/image.naturalHeight);setReady(true);
    };
    image.onerror=()=>{if(active)onError('This image could not be decoded. Try another image.');};
    image.src=src;
    return ()=>{active=false;};
  },[src]);
  const locked=disabled||working||!ready;
  const position=(event:React.PointerEvent<HTMLDivElement>)=>{
    const rect=event.currentTarget.getBoundingClientRect();
    return {x:Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100)),
      y:Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))};
  };
  const transform=(rotation:number)=>{
    if(locked||!canvas.current)return;
    const source=canvas.current;
    const target=document.createElement('canvas');
    const x=Math.floor(source.width*crop.left/100),y=Math.floor(source.height*crop.top/100);
    const width=Math.max(1,Math.min(source.width-x,Math.round(source.width*crop.width/100)));
    const height=Math.max(1,Math.min(source.height-y,Math.round(source.height*crop.height/100)));
    target.width=rotation?source.height:width;target.height=rotation?source.width:height;
    const context=target.getContext('2d');
    if(!context){onError('Image editing is unavailable in this browser.');return;}
    setWorking(true);onWorking(true);
    try{
      if(rotation){context.translate(target.width/2,target.height/2);context.rotate(rotation*Math.PI/180);context.drawImage(source,-source.width/2,-source.height/2);}
      else context.drawImage(source,x,y,width,height,0,0,width,height);
      target.toBlob(blob=>{
        if(blob)onApply(blob);else onError('Could not prepare the edited image.');
        setWorking(false);onWorking(false);
      },'image/png');
    }catch{setWorking(false);onWorking(false);onError('Image editing failed. Try a smaller image.');}
  };
  return <div className="image-editor">
    <p id="crop-help">Drag over the image to select text, or adjust the crop percentages below. Apply crop before extracting.</p>
    <div className="crop-stage" style={{maxWidth:420*aspect}} aria-label="Image crop selection" onPointerDown={event=>{
      if(locked)return;event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);start.current=position(event);
    }} onPointerMove={event=>{
      if(!start.current||locked)return;
      const end=position(event),origin=start.current;
      setCrop({left:Math.min(origin.x,end.x),top:Math.min(origin.y,end.y),width:Math.abs(end.x-origin.x),height:Math.abs(end.y-origin.y)});
    }} onPointerUp={()=>{start.current=null;}} onPointerCancel={()=>{start.current=null;}}>
      <canvas ref={canvas} role="img" aria-label="Image preview for cropping"/>
      {ready&&<div className="crop-outline" style={{left:`${crop.left}%`,top:`${crop.top}%`,width:`${crop.width}%`,height:`${crop.height}%`}}/>}
    </div>
    <fieldset disabled={locked} className="crop-fields" aria-describedby="crop-help"><legend>Crop area (%)</legend>
      {(['left','top','width','height'] as const).map(key=><label key={key}>{key}<input type="number" min={key==='width'||key==='height'?1:0} max={100} value={Math.round(crop[key]*10)/10} onChange={event=>{
        const value=event.target.valueAsNumber;if(!Number.isFinite(value))return;
        setCrop(previous=>{
          const next={...previous,[key]:Math.max(key==='width'||key==='height'?1:0,Math.min(100,value))};
          next.left=Math.min(next.left,99);next.top=Math.min(next.top,99);
          next.width=Math.min(next.width,100-next.left);next.height=Math.min(next.height,100-next.top);return next;
        });
      }}/></label>)}
    </fieldset>
    <div className="editor-actions">
      <button disabled={locked||crop.width<1||crop.height<1} onClick={()=>transform(0)}>Apply crop</button>
      <button disabled={locked} onClick={()=>transform(-90)}>Rotate left</button>
      <button disabled={locked} onClick={()=>transform(90)}>Rotate right</button>
      <button disabled={locked} onClick={()=>setCrop({left:0,top:0,width:100,height:100})}>Select all</button>
    </div>
  </div>;
}
