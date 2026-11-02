import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';

function samplePdf(){
  const content='0 g 10 10 20 20 re f\n';
  const objects=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources << >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  ];
  let pdf='%PDF-1.4\n';const offsets=[0];
  objects.forEach((object,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${object}\nendobj\n`;});
  const start=pdf.length;
  pdf+=`xref\n0 5\n0000000000 65535 f \n${offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
test('PDF.js opens and renders an actual PDF and rejects damaged input',async()=>{
  const task=getDocument({data:samplePdf()});
  const pdf=await task.promise;
  try{
    assert.equal(pdf.numPages,1);
    const page=await pdf.getPage(1);
    const viewport=page.getViewport({scale:2});
    const target=pdf.canvasFactory.create(200,200);
    try{
      await page.render({canvas:target.canvas,canvasContext:target.context,viewport}).promise;
      assert.equal(target.canvas.width,200);
      const pixel=target.context.getImageData(30,160,1,1).data;
      assert.equal(pixel[0],0);assert.equal(pixel[3],255);
    }finally{pdf.canvasFactory.destroy(target);page.cleanup();}
  }finally{await task.destroy();}
  const invalid=getDocument({data:new TextEncoder().encode('not a PDF')});
  try{await assert.rejects(invalid.promise);}finally{await invalid.destroy();}
});
