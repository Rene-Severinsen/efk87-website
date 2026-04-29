'use client';

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useState } from "react";

interface ArticleRichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const ArticleRichTextEditor = ({ content, onChange }: ArticleRichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize editor
  const editor = useCreateBlockNote();

  // Effect to load initial content
  useEffect(() => {
    async function loadInitialContent() {
      if (content && editor && isMounted) {
        const blocks = await editor.tryParseHTMLToBlocks(content);
        editor.replaceBlocks(editor.document, blocks);
      }
    }
    loadInitialContent();
    // Only run once on mount or when editor is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, isMounted]);

  if (!editor || !isMounted) {
    return null;
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 resize-y overflow-auto min-h-[420px] max-h-[900px]">
      <BlockNoteView 
        editor={editor} 
        onChange={async () => {
          const html = await editor.blocksToHTMLLossy(editor.document);
          onChange(html);
        }}
        theme="light" // Or handle dark mode if needed
      />
      <style jsx global>{`
        .bn-container {
          min-height: 100%;
        }
        .bn-editor {
          min-height: 400px;
        }
        /* Fix for potential z-index issues or toolbar positioning if any */
      `}</style>
    </div>
  );
};

export default ArticleRichTextEditor;
