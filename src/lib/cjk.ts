export function detectCJKLang(text: string): string | null {
  const chinese = /[\u4e00-\u9fff]/g;
  const japanese = /[\u3040-\u30ff]/g;
  const korean = /[\uac00-\ud7af]/g;

  const chineseCount = (text.match(chinese) || []).length;
  const japaneseCount = (text.match(japanese) || []).length;
  const koreanCount = (text.match(korean) || []).length;
  const total = text.length;

  if (total === 0) return null;

  const cjkRatio = (chineseCount + japaneseCount + koreanCount) / total;

  if (cjkRatio < 0.3) return null;

  if (japaneseCount > chineseCount && japaneseCount > koreanCount) return "ja";
  if (koreanCount > chineseCount && koreanCount > japaneseCount) return "ko";
  if (chineseCount > 0) return "zh";

  return null;
}
