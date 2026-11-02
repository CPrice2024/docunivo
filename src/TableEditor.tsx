import {useState} from 'react';
import {repairTable, type TableAction} from './table-tools';

export function TableEditor({table,onChange,disabled}:{table:string[][];onChange:(next:string[][])=>void;disabled:boolean}){
  const [selection,setSelection]=useState({row:0,column:0});
  const [separator,setSeparator]=useState(' ');
  const [history,setHistory]=useState<string[][][]>([]);
  const row=Math.min(selection.row,table.length-1),column=Math.min(selection.column,table[0].length-1);
  const commit=(next:string[][])=>{
    if(disabled||next===table)return;
    setHistory(previous=>[...previous.slice(-19),table]);onChange(next);
  };
  const action=(value:TableAction)=>commit(repairTable(table,value,row,column,separator));
  return <div className="table-editor">
    <p className="table-summary" aria-live="polite">{table.length} rows / {table[0].length} columns. Selected: row {row+1}, column {column+1}.</p>
    <fieldset disabled={disabled} className="table-toolbar"><legend>Repair table</legend>
      <button onClick={()=>action('insert-row')}>Add row below</button>
      <button disabled={table.length===1} onClick={()=>action('delete-row')}>Delete row</button>
      <button onClick={()=>action('insert-column')}>Add column right</button>
      <button disabled={table[0].length===1} onClick={()=>action('delete-column')}>Delete column</button>
      <button disabled={column===table[0].length-1} onClick={()=>action('merge-right')}>Merge with right column</button>
      <label>Split separator<select value={separator} onChange={event=>setSeparator(event.target.value)}><option value=" ">Space</option><option value={'\t'}>Tab</option><option value=",">Comma</option><option value=";">Semicolon</option><option value="|">Vertical bar</option></select></label>
      <button onClick={()=>action('split-column')}>Split selected column</button>
      <button disabled={!history.length} onClick={()=>{const previous=history[history.length-1];if(previous){onChange(previous);setHistory(history.slice(0,-1));}}}>Undo</button>
    </fieldset>
    <p className="notice">Select a cell to choose its row and column. Merge combines text; split uses the separator across all rows. Undo keeps the last 20 edits.</p>
    <div className="table-preview"><table><thead><tr><th scope="col">Row</th>{table[0].map((_,c)=><th key={c} scope="col">Column {c+1}</th>)}</tr></thead><tbody>{table.map((line,r)=><tr key={r}><th scope="row">{r+1}</th>{line.map((cell,c)=><td key={c} className={r===row&&c===column?'selected-cell':''}><input disabled={disabled} aria-label={`Row ${r+1}, column ${c+1}`} value={cell} onFocus={()=>setSelection({row:r,column:c})} onChange={event=>commit(table.map((values,i)=>i===r?values.map((value,j)=>j===c?event.target.value:value):values))}/></td>)}</tr>)}</tbody></table></div>
  </div>;
}
