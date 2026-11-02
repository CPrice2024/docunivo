import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseReceipt,receiptRows,receiptWarnings,emptyReceipt} from './receipt.ts';
test('parses items, explicit quantities and summary without treating payment as goods',()=>{
  const receipt=parseReceipt('Corner Shop\n2026-10-28\nCoffee 2 x 3.00 6.00\nCake 4.00\nSubtotal 10.00\nTax 1.00\nTotal 11.00\nCash 20.00\nChange 9.00');
  assert.deepEqual(receipt.items,[{description:'Coffee',quantity:'2',unitPrice:'3.00',amount:'6.00'},{description:'Cake',quantity:'',unitPrice:'',amount:'4.00'}]);
  assert.equal(receipt.total,'11.00');assert.equal(receipt.subtotal,'10.00');
  assert.deepEqual(receiptWarnings(receipt),[]);
  assert.ok(receipt.unmatched.includes('Cash 20.00'));
  assert.equal(receipt.merchant,'');assert.equal(receipt.date,'');
});
test('preserves unsupported amounts and duplicate totals for review',()=>{
  const receipt=parseReceipt('Milk 4,50\nTotal 5.00\nTotal 6.00\nInvoice 12345');
  assert.equal(receipt.total,'5.00');assert.equal(receipt.items.length,0);
  assert.deepEqual(receipt.unmatched,['Milk 4,50','Total 6.00','Invoice 12345']);
});
test('recognizes thousands separators and discounts and warns about total mismatch',()=>{
  const receipt=parseReceipt('Chair $1,000.00\nSubtotal 1000.00\nDiscount 10.00\nTotal 990.00');
  assert.equal(receipt.items[0].amount,'1000.00');assert.deepEqual(receiptWarnings(receipt),[]);
  receipt.total='900.00';assert.ok(receiptWarnings(receipt).some(value=>value.includes('does not match')));
});
test('CSV rows carry edited metadata and exclude unmatched text',()=>{
  const receipt=parseReceipt('Shop\nTea 2.00\nTotal 2.00');receipt.merchant='Edited shop';receipt.currency='ETB';
  const rows=receiptRows(receipt);
  assert.deepEqual(rows[1],['Item','Edited shop','','ETB','Tea','','','2.00']);
  assert.equal(rows.length,3);assert.equal(rows[2][4],'total');
  assert.ok(receiptWarnings(emptyReceipt()).length);
});
