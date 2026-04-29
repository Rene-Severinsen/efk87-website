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

  // Effect to load initial content or reset content
  useEffect(() => {
    async function updateContent() {
      if (editor && isMounted) {
        // If content is empty, clear the editor
        if (!content || content === "" || content === "<p></p>") {
          editor.replaceBlocks(editor.document, [editor.document[0]]);
          // Optionally delete the first block if you want it completely empty, 
          // but BlockNote usually requires at least one block.
          // Let's just replace everything with a default empty block.
          const blocks = await editor.tryParseHTMLToBlocks("");
          editor.replaceBlocks(editor.document, blocks);
          return;
        }

        // Only update if current editor content differs from prop content
        // to avoid cursor jumping/loops. 
        // Note: blocksToHTMLLossy is async, so we might need a better way to check.
        const currentHtml = await editor.blocksToHTMLLossy(editor.document);
        if (currentHtml !== content) {
          const blocks = await editor.tryParseHTMLToBlocks(content);
          editor.replaceBlocks(editor.document, blocks);
        }
      }
    }
    updateContent();
    // We want to react to content changes specifically for resets
    // but we must be careful not to cause loops when typing.
  }, [editor, isMounted, content]);

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
