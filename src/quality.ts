export type Quality = {
  level: 'empty' | 'low' | 'review' | 'normal';
  confidence: number | null;
  title: string;
  advice: string;
};

// Heuristic screening, not a guarantee that recognized text is correct.
export function assessQuality(text: string, words: {text: string; confidence: number}[]): Quality {
  const characters = [...text].filter(c => !/\s/u.test(c));
  const lettersOrNumbers = characters.filter(c => /[\p{L}\p{N}]/u.test(c)).length;
  const scored = words.filter(w => w.text.trim() && Number.isFinite(w.confidence) && w.confidence >= 0 && w.confidence <= 100);
  const weight = scored.reduce((sum, w) => sum + w.text.trim().length, 0);
  const confidence = weight ? Math.round(scored.reduce((sum, w) => sum + w.confidence * w.text.trim().length, 0) / weight) : null;
  if (!characters.length) return {level:'empty', confidence, title:'No readable text detected', advice:'Try a clear document image, or crop closely around the text. Photos of objects may contain no text.'};
  const symbolHeavy = lettersOrNumbers / characters.length < .45;
  if (symbolHeavy || (confidence !== null && confidence < 45)) {
    return {level:'low', confidence, title:'No reliable text detected', advice:'Patterns and image details may have been mistaken for letters. Review the result, crop around actual text, or try a clearer image. English text is supported.'};
  }
  if (confidence === null || confidence < 75) return {level:'review', confidence, title:'Review recognition carefully', advice:'Some text may be incorrect. Compare the result with your image before copying or downloading.'};
  return {level:'normal', confidence, title:'Text extracted — review before use', advice:'OCR confidence is an engine estimate, not a measured accuracy score. Check names, numbers and table cells.'};
}
