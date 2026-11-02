import {receiptWarnings,type Receipt,type ReceiptItem} from './receipt';
export function ReceiptEditor({receipt,onChange,disabled}:{receipt:Receipt;onChange:(value:Receipt)=>void;disabled:boolean}){
  const warnings=receiptWarnings(receipt);
  const fields=['merchant','date','currency','subtotal','tax','discount','total'] as const;
  const columns=['description','quantity','unitPrice','amount'] as const;
  const names={description:'Description',quantity:'Quantity',unitPrice:'Unit price',amount:'Line amount'};
  return <div className="receipt-editor"><p className="notice">English receipt beta. Decimal-point amounts are detected; unsupported lines are preserved below. Missing quantities and prices stay blank. Check against the original receipt.</p>
    <fieldset disabled={disabled} className="receipt-fields"><legend>Receipt details</legend>{fields.map(field=><label key={field}>{field}<input value={receipt[field]} placeholder={field==='currency'?'e.g. ETB, USD':undefined} onChange={event=>onChange({...receipt,[field]:event.target.value})}/></label>)}</fieldset>
    <div className="table-preview"><table><thead><tr>{columns.map(column=><th key={column}>{names[column]}</th>)}<th>Remove</th></tr></thead><tbody>{receipt.items.map((item,index)=><tr key={index}>{columns.map(column=><td key={column}><input disabled={disabled} aria-label={`Item ${index+1} ${names[column]}`} value={item[column]} onChange={event=>onChange({...receipt,items:receipt.items.map((value,i)=>i===index?{...value,[column]:event.target.value}:value)})}/></td>)}<td><button disabled={disabled} aria-label={`Remove item ${index+1}`} onClick={()=>onChange({...receipt,items:receipt.items.filter((_,i)=>i!==index)})}>Remove</button></td></tr>)}</tbody></table></div>
    <button className="receipt-add" disabled={disabled} onClick={()=>{const item:ReceiptItem={description:'',quantity:'',unitPrice:'',amount:''};onChange({...receipt,items:[...receipt.items,item]});}}>Add item</button>
    {!!warnings.length&&<div className="quality quality-review" role="status"><strong>Receipt checks</strong><ul>{warnings.map(warning=><li key={warning}>{warning}</li>)}</ul></div>}
    {!!receipt.unmatched.length&&<details><summary>{receipt.unmatched.length} lines need manual review</summary><p className="notice">These may include the merchant, date, payment details or unrecognized items. They are excluded from CSV until you add them to the fields above.</p><pre>{receipt.unmatched.join('\n')}</pre></details>}
  </div>;
}
