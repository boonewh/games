import type { StoryBlockContent, StoryInlineNode, StoryMark } from '@/types/story';

// Shape of a TipTap text-node child as it appears in editor JSON
type TiptapTextChild = {
  type?: string;
  text?: string;
  marks?: Array<{ type: string }>;
};

// Public functions accept `unknown` so callers don't need to cast block.content
// (StoryBlock's union includes a Record<string, unknown> escape hatch that defeats narrowing).

export function isInlineNodes(content: unknown): content is StoryInlineNode[] {
  return (
    Array.isArray(content) &&
    content.every(
      (n) =>
        n &&
        typeof n === 'object' &&
        'type' in n &&
        (n as { type: string }).type === 'text'
    )
  );
}

// Extract plain text from either storage form (string or inline nodes).
// Used for excerpts, title comparisons, and any place that wants flat text.
export function blockText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (isInlineNodes(content)) return content.map((n) => n.text || '').join('');
  return '';
}

// Normalize storage content to inline-node form. Empty content returns an empty array.
// Used when feeding stored blocks into TipTap (which expects inline children).
export function blockInlineNodes(content: unknown): StoryInlineNode[] {
  if (typeof content === 'string') {
    return content !== '' ? [{ type: 'text', text: content }] : [];
  }
  if (isInlineNodes(content)) {
    // Filter out any empty-text nodes (TipTap dislikes them) and copy marks defensively.
    return content
      .filter((n) => typeof n.text === 'string' && n.text !== '')
      .map((n) => {
        const out: StoryInlineNode = { type: 'text', text: n.text };
        if (n.marks && n.marks.length > 0) {
          out.marks = n.marks.map((m) => ({ type: m.type }));
        }
        return out;
      });
  }
  return [];
}

// Convert a TipTap node's `content` children into storage content.
// If no marks are present anywhere, returns a plain string (compact form,
// backward-compatible with old readers). If any run has marks, returns
// inline nodes so formatting is preserved.
export function tiptapChildrenToContent(
  children: TiptapTextChild[] | undefined
): StoryBlockContent {
  const textNodes = (children || []).filter(
    (c) => c.type === 'text' && typeof c.text === 'string'
  );

  const anyMarks = textNodes.some((c) => c.marks && c.marks.length > 0);

  if (!anyMarks) {
    // Plain prose -> store as string (matches legacy format)
    return textNodes.map((c) => c.text || '').join('');
  }

  // Has marks -> store as inline-node array
  return textNodes.map((c) => {
    const node: StoryInlineNode = { type: 'text', text: c.text || '' };
    if (c.marks && c.marks.length > 0) {
      node.marks = c.marks.map((m): StoryMark => ({ type: m.type }));
    }
    return node;
  });
}

// Convert storage content into TipTap children for loading into the editor
// or feeding the adventure-log renderer.
export function contentToTiptapChildren(
  content: unknown
): Array<{ type: 'text'; text: string; marks?: Array<{ type: string }> }> {
  return blockInlineNodes(content).map((n) => {
    const out: { type: 'text'; text: string; marks?: Array<{ type: string }> } = {
      type: 'text',
      text: n.text,
    };
    if (n.marks && n.marks.length > 0) {
      out.marks = n.marks.map((m) => ({ type: m.type }));
    }
    return out;
  });
}

// Re-export the content type so call sites can import from one place if they want.
export type { StoryBlockContent };
