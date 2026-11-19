export interface MarkdownBlock {
  type: 'code' | 'paragraph' | 'list' | 'heading';
  content: string;
  language?: string;
  items?: string[];
  level?: number;
}

export function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const content = paragraphBuffer.join('\n').trim();
      if (content) {
        blocks.push({ type: 'paragraph', content });
      }
      paragraphBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        blocks.push({
          type: 'code',
          content: codeBuffer.join('\n'),
          language: codeLang || 'text',
        });
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        // Start of code block
        flushParagraph();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Heading check
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      continue;
    }

    // Empty line separates paragraphs
    if (line.trim() === '') {
      flushParagraph();
      continue;
    }

    paragraphBuffer.push(line);
  }

  // Flush remaining buffers
  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({
      type: 'code',
      content: codeBuffer.join('\n'),
      language: codeLang || 'text',
    });
  } else {
    flushParagraph();
  }

  return blocks;
}
