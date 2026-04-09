import type { Section } from '../../types/section';

export interface SectionImageRef {
  url: string;
  caption?: string;
}

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

/**
 * Pulls markdown image syntax out of section prose so figures render as media blocks.
 * Does not fetch or validate URLs — content remains author-controlled.
 */
export function extractMarkdownImages(content: string): { text: string; images: SectionImageRef[] } {
  const images: SectionImageRef[] = [];
  const text = content
    .replace(MARKDOWN_IMAGE, (_full, caption, url) => {
      const u = String(url).trim();
      if (u) {
        images.push({
          url: u,
          caption: String(caption ?? '').trim() || undefined,
        });
      }
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text, images };
}

/**
 * Combines structured `illustrations` from the dataset with any `![alt](url)` in `content`.
 * De-duplicates by URL; structured illustrations come first.
 */
export function mergeSectionVisuals(section: Pick<Section, 'content' | 'illustrations'>): {
  text: string;
  images: SectionImageRef[];
} {
  const { text, images: fromMarkdown } = extractMarkdownImages(section.content);
  const fromData = section.illustrations ?? [];
  const seen = new Set<string>();
  const merged: SectionImageRef[] = [];
  for (const item of [...fromData, ...fromMarkdown]) {
    if (!item?.url || seen.has(item.url)) continue;
    seen.add(item.url);
    merged.push({ url: item.url, caption: item.caption });
  }
  return { text, images: merged };
}
