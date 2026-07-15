/** Short hook title from free-form archetype prose (no new JSON fields). */
export function extractHook(text: string, maxLen = 48): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return '';

  const sentence = clean.match(/^(.+?[.!?])(?:\s|$)/);
  if (sentence && sentence[1].length <= maxLen + 1) {
    return sentence[1].replace(/[.!?]+$/, '').trim();
  }

  const clause = clean.match(/^(.{8,}?)[:—–]\s+/);
  if (clause && clause[1].length <= maxLen) {
    return clause[1].trim();
  }

  if (clean.length <= maxLen) return clean;

  const sliced = clean.slice(0, maxLen);
  const lastSpace = sliced.lastIndexOf(' ');
  const base = (lastSpace > 16 ? sliced.slice(0, lastSpace) : sliced).trim();
  return `${base}…`;
}

export function truncateText(text: string, max = 120): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max);
  const lastSpace = sliced.lastIndexOf(' ');
  const base = (lastSpace > max * 0.5 ? sliced.slice(0, lastSpace) : sliced).trim();
  return `${base}…`;
}

/** Body after the hook — avoids repeating the title in the card text. */
export function teaserBody(text: string, hook: string, maxLen = 120): string {
  let rest = text.trim().replace(/\s+/g, ' ');
  if (!rest) return '';

  const hookClean = hook.replace(/…$/, '').trim();
  if (hookClean && rest.toLowerCase().startsWith(hookClean.toLowerCase())) {
    rest = rest.slice(hookClean.length).replace(/^[:—–.\s!?]+/, '');
  } else {
    const firstSentence = rest.match(/^[^.!?]+[.!?]\s*/);
    if (firstSentence) {
      rest = rest.slice(firstSentence[0].length);
    } else {
      const firstClause = rest.match(/^[^:—–]+[:—–]\s*/);
      if (firstClause) rest = rest.slice(firstClause[0].length);
    }
  }

  return truncateText(rest, maxLen);
}

export function splitTeaser(text: string, hookMax = 48, bodyMax = 120) {
  const title = extractHook(text, hookMax);
  const textBody = teaserBody(text, title, bodyMax);
  return { title, text: textBody || truncateText(text, bodyMax) };
}
