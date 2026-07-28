/**
 * Removes exact sentence repeats while keeping the author's paragraph breaks.
 * Generated reports often assemble prose from several reusable layers; this
 * keeps those layers from echoing one another in a single reading.
 */
export function withoutRepeatedSentences(paragraphs: string[]): string[] {
  const seen = new Set<string>();

  return paragraphs
    .map((paragraph) => {
      const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [paragraph];
      const kept: string[] = [];

      for (const sentence of sentences) {
        const key = sentence.replace(/\s+/g, " ").trim().toLocaleLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        kept.push(sentence.trim());
      }

      return kept.join(" ").trim();
    })
    .filter(Boolean);
}