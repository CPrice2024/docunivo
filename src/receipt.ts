export type ReceiptItem={description:string;quantity:string;unitPrice:string;amount:string};
export type Receipt={merchant:string;date:string;currency:string;subtotal:string;tax:string;discount:string;total:string;items:ReceiptItem[];unmatched:string[]};
export function emptyReceipt():Receipt{return {merchant:'',date:'',currency:'',subtotal:'',tax:'',discount:'',total:'',items:[],unmatched:[]};}

export function parseReceipt(text:string):Receipt{
  const receipt=emptyReceipt();
  for(const original of text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean)){
    // Conservative: only trailing decimal amounts; unrecognized lines remain visible.
    const match=original.match(/^(.*?)\s+([$€£]?\s*-?(?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2})\s*$/u);
    if(!match){receipt.unmatched.push(original);continue;}
    const label=match[1].trim(),amount=match[2].replace(/[$€£,\s]/gu,'');
    if(/^(sub\s*total|tax|vat|sales tax|discount|total|grand total|amount due)\b/i.test(label)){
      const key=/^sub/i.test(label)?'subtotal':/^(tax|vat|sales tax)/i.test(label)?'tax':/^discount/i.test(label)?'discount':'total';
      if(receipt[key])receipt.unmatched.push(original);else receipt[key]=amount;
      continue;
    }
    if(/\b(cash|change|card|visa|mastercard|tender|balance|payment|paid|saving)\b/i.test(label)){
      receipt.unmatched.push(original);continue;
    }
    if(!/[a-z]/i.test(label)){receipt.unmatched.push(original);continue;}
    const details=label.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*[x×@]\s*[$€£]?(\d+\.\d{2})$/u);
    receipt.items.push({description:details?details[1]:label,quantity:details?details[2]:'',unitPrice:details?details[3]:'',amount});
  }
  return receipt;
}

export function receiptWarnings(receipt:Receipt):string[]{
  const warnings:string[]=[];
  if(!receipt.items.length)warnings.push('No receipt items detected. Add items manually or try a clearer crop.');
  const money=/^-?\d+(?:\.\d{1,2})?$/;
  if(receipt.items.some(item=>!item.description.trim()||!money.test(item.amount)))warnings.push('Some items have a missing description or invalid amount.');
  if(['subtotal','tax','discount','total'].some(key=>{const value=receipt[key as 'total'];return value!==''&&!money.test(value);}))warnings.push('Check summary amounts: use a decimal point and no currency symbols.');
  const sum=receipt.items.reduce((total,item)=>total+(money.test(item.amount)?Math.round(Number(item.amount)*100):0),0);
  if(receipt.subtotal&&money.test(receipt.subtotal)&&Math.abs(sum-Math.round(Number(receipt.subtotal)*100))>1)warnings.push('Item amounts do not match the receipt subtotal.');
  if(receipt.subtotal&&receipt.total&&[receipt.subtotal,receipt.total,receipt.tax||'0',receipt.discount||'0'].every(value=>money.test(value))){
    const expected=Math.round(Number(receipt.subtotal)*100)+Math.round(Number(receipt.tax||0)*100)-Math.abs(Math.round(Number(receipt.discount||0)*100));
    if(Math.abs(expected-Math.round(Number(receipt.total)*100))>1)warnings.push('Subtotal plus tax minus discount does not match the total. Check for fees, tips or OCR mistakes.');
  }
  return warnings;
}

export function receiptRows(receipt:Receipt):string[][]{
  const rows=[['Type','Merchant','Date','Currency','Description','Quantity','Unit price','Amount']];
  for(const item of receipt.items)rows.push(['Item',receipt.merchant,receipt.date,receipt.currency,item.description,item.quantity,item.unitPrice,item.amount]);
  for(const key of ['subtotal','tax','discount','total'] as const)if(receipt[key])rows.push(['Summary',receipt.merchant,receipt.date,receipt.currency,key,'','',receipt[key]]);
  return rows;
}
