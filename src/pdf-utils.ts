export function selectedPages(first:number,last:number,total:number):number[]{
  if(!Number.isInteger(first)||!Number.isInteger(last)||first<1||last<first||last>total)throw new Error('Choose a valid page range within the PDF.');
  if(last-first+1>20)throw new Error('Process up to 20 pages at a time to limit memory use.');
  return Array.from({length:last-first+1},(_,i)=>first+i);
}
export function renderScale(width:number,height:number):number{
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('Invalid PDF page dimensions.');
  return Math.min(2,Math.sqrt(4_000_000/(width*height)),4096/width,4096/height);
}
