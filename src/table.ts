export type PositionedWord = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

// Infer shared vertical gutters, independently of the OCR engine's reading order.
export function detectTable(words: PositionedWord[]): string[][] {
  const valid = words.filter(w => w.text.trim() && Object.values(w.bbox).every(Number.isFinite)
    && w.bbox.x1 > w.bbox.x0 && w.bbox.y1 > w.bbox.y0);
  if (!valid.length) return [];
  const heights = valid.map(w => w.bbox.y1 - w.bbox.y0).sort((a, b) => a - b);
  const height = heights[Math.floor(heights.length / 2)];
  const rows: { center: number; words: PositionedWord[] }[] = [];
  for (const word of [...valid].sort((a, b) => a.bbox.y0 - b.bbox.y0)) {
    const center = (word.bbox.y0 + word.bbox.y1) / 2;
    const row = rows.find(r => Math.abs(r.center - center) <= height * .55);
    if (row) {
      row.center = (row.center * row.words.length + center) / (row.words.length + 1);
      row.words.push(word);
    } else rows.push({ center, words: [word] });
  }
  rows.sort((a, b) => a.center - b.center);
  const gaps: { start: number; end: number; row: number }[] = [];
  rows.forEach((row, index) => {
    row.words.sort((a, b) => a.bbox.x0 - b.bbox.x0);
    row.words.slice(1).forEach((word, i) => {
      const start = row.words[i].bbox.x1;
      if (word.bbox.x0 - start >= height * 1.5) gaps.push({ start, end: word.bbox.x0, row: index });
    });
  });
  const edges = [...new Set(gaps.flatMap(g => [g.start, g.end]))].sort((a, b) => a - b);
  const regions: { start: number; end: number }[] = [];
  const required = Math.max(2, Math.ceil(rows.length * .6));
  for (let i = 1; i < edges.length; i++) {
    const mid = (edges[i - 1] + edges[i]) / 2;
    if (new Set(gaps.filter(g => g.start < mid && g.end > mid).map(g => g.row)).size < required) continue;
    const last = regions[regions.length - 1];
    if (last?.end === edges[i - 1]) last.end = edges[i];
    else regions.push({ start: edges[i - 1], end: edges[i] });
  }
  const cuts = regions.filter(r => r.end - r.start >= height).map(r => (r.start + r.end) / 2);
  return rows.map(row => {
    const cells = Array<string>(cuts.length + 1).fill('');
    for (const word of row.words) {
      const center = (word.bbox.x0 + word.bbox.x1) / 2;
      const column = cuts.filter(cut => center > cut).length;
      cells[column] += (cells[column] ? ' ' : '') + word.text.trim();
    }
    return cells;
  });
}
