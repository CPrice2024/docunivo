import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';

test('Excel export retains blanks, Unicode, leading zeros, and literal formulas', () => {
  const rows = [['Item', 'Code', 'Notes'], ['Coffee', '0012', ''], ['\u12a0\u121b\u122d\u129b', '', '=1+1']];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Extracted');
  const restored = XLSX.read(XLSX.write(workbook, {type:'array', bookType:'xlsx'}), {type:'array'});
  assert.deepEqual(XLSX.utils.sheet_to_json(restored.Sheets.Extracted, {header:1, defval:''}), rows);
  assert.equal(restored.Sheets.Extracted.C3.t, 's');
  assert.equal(restored.Sheets.Extracted.C3.f, undefined);
});
