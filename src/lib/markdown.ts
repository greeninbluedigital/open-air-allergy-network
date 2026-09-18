/**
 * Strips common Markdown syntax down to plain text — for meta
 * descriptions/OG tags, where literal `##`/`**`/`- ` characters would look
 * broken rather than rendering as formatting.
 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/^>\s?/gm, "") // blockquotes
    .replace(/^[-*+]\s+/gm, "") // bullet list markers
    .replace(/^\d+\.\s+/gm, "") // numbered list markers
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/\n{2,}/g, " ") // collapse blank lines
    .replace(/\n/g, " ")
    .trim();
}
