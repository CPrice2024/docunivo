import {pipeline,RawImage,env} from '@huggingface/transformers';

env.allowLocalModels=false;
// One WASM thread avoids requiring cross-origin isolation on local/static hosting.
if(env.backends.onnx?.wasm)env.backends.onnx.wasm.numThreads=1;
let running=false;
self.onmessage=async(event:MessageEvent<{file:Blob}>)=>{
  if(running)return;
  running=true;
  try{
    if(typeof OffscreenCanvas==='undefined')throw new Error('This browser does not support background image processing. Try a current Chrome or Edge browser.');
    self.postMessage({type:'status',message:'Decoding image...'});
    let image=await RawImage.fromBlob(event.data.file);
    const scale=Math.min(1,2048/Math.max(image.width,image.height));
    if(scale<1)image=await image.resize(Math.max(1,Math.round(image.width*scale)),Math.max(1,Math.round(image.height*scale)));
    self.postMessage({type:'status',message:'Loading background removal model. First use may take a few minutes...'});
    const segmenter=await pipeline('background-removal','onnx-community/ormbg-ONNX',{
      device:'wasm',dtype:'q8',
      progress_callback:progress=>{
        if(progress.status==='progress')self.postMessage({type:'status',message:`Downloading ${progress.file}: ${Math.round(progress.progress)}%`});
      },
    });
    try{
      self.postMessage({type:'status',message:'Removing background on your device...'});
      const output=await segmenter([image]);
      const result=output[0];
      if(!result)throw new Error('The model did not return an image.');
      const canvas=new OffscreenCanvas(result.width,result.height);
      const context=canvas.getContext('2d');if(!context)throw new Error('Image export is unavailable.');
      const rgba=result.rgba();
      const pixels=context.createImageData(rgba.width,rgba.height);pixels.data.set(rgba.data);context.putImageData(pixels,0,0);
      const blob=await canvas.convertToBlob({type:'image/png'});
      self.postMessage({type:'done',blob,width:result.width,height:result.height});
    }finally{await segmenter.dispose();}
  }catch(error){self.postMessage({type:'error',message:error instanceof Error?error.message:'Background removal failed.'});}
  finally{running=false;}
};
