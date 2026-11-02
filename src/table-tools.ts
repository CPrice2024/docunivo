export type TableAction = 'insert-row' | 'delete-row' | 'insert-column' | 'delete-column' | 'merge-right' | 'split-column';

export function repairTable(table:string[][], action:TableAction, row:number, column:number, separator=' '):string[][] {
  if(!table.length||!table[0].length||row<0||row>=table.length||column<0||column>=table[0].length)return table;
  const result=table.map(line=>[...line]);
  switch(action){
    case 'insert-row': result.splice(row+1,0,Array(table[0].length).fill(''));break;
    case 'delete-row': if(result.length>1)result.splice(row,1);break;
    case 'insert-column': result.forEach(line=>line.splice(column+1,0,''));break;
    case 'delete-column': if(table[0].length>1)result.forEach(line=>line.splice(column,1));break;
    case 'merge-right':
      if(column>=table[0].length-1)return table;
      result.forEach(line=>line.splice(column,2,[line[column],line[column+1]].filter(Boolean).join(' ')));break;
    case 'split-column': {
      if(!separator)return table;
      const parts=table.map(line=>line[column].split(separator));
      const count=Math.max(...parts.map(part=>part.length));
      if(count===1)return table;
      result.forEach((line,index)=>line.splice(column,1,...Array.from({length:count},(_,i)=>parts[index][i]??'')));break;
    }
  }
  return result;
}

export function toCsv(table:string[][]):string {
  // Quote every field and neutralize spreadsheet formula prefixes for CSV consumers.
  return '\uFEFF'+table.map(row=>row.map(value=>{
    const safe=/^[\s\u0000-\u001f]*[=+@-]/u.test(value)?"'"+value:value;
    return '"'+safe.replace(/"/g,'""')+'"';
  }).join(',')).join('\r\n');
}
