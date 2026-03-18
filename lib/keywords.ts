export interface KeywordMap {
  required: string[];
  preferred: string[];
  technical: string[];
  soft: string[];
  jobTitle: string;
  company: string;
}

export function highlightKeywords(text: string, keywords: KeywordMap): string {
  const allKeywords = [...keywords.required, ...keywords.preferred, ...keywords.technical, ...keywords.soft];
  let result = text;
  for (const kw of allKeywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
    result = result.replace(regex, `<mark>$1</mark>`);
  }
  return result;
}

export function findMissingKeywords(text: string, keywords: KeywordMap): { found: string[]; missing: string[] } {
  const lower = text.toLowerCase();
  const allKeywords = [...keywords.required, ...keywords.technical];
  const found: string[] = [];
  const missing: string[] = [];
  for (const kw of allKeywords) {
    if (lower.includes(kw.toLowerCase())) {
      found.push(kw);
    } else {
      missing.push(kw);
    }
  }
  return { found, missing };
}
