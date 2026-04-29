'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useCallback } from 'react';

interface ArticleRichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const ArticleRichTextEditor = ({ content, onChange }: ArticleRichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'text-blue-600 underline hover:no-underline cursor-pointer',
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Indsæt billede via URL');

    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Indsæt link URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
      <div className="flex flex-wrap items-center px-3 py-2 border-b border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap items-center space-x-1 rtl:space-x-reverse">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${editor.isActive('bold') ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : ''}`}
            title="Fed (Ctrl+B)"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15h4.5a3.5 3.5 0 1 0 0-7H8v7Zm0-7V4m0 11v4m0-11h4a3.5 3.5 0 1 1 0 7H8m4-7h2a3.5 3.5 0 1 1 0 7h-2" />
            </svg>
            <span className="sr-only">Fed</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${editor.isActive('italic') ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : ''}`}
            title="Kursiv (Ctrl+I)"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.874 19 6.126-14M6 19h6M12 5h6" />
            </svg>
            <span className="sr-only">Kursiv</span>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : ''}`}
            title="Overskrift 2 (H2)"
          >
            <span className="text-xs font-bold pointer-events-none">H2</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : ''}`}
            title="Overskrift 3 (H3)"
          >
            <span className="text-xs font-bold pointer-events-none">H3</span>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : ''}`}
            title="Punktopstilling"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.01 4H5m-.01 4H5" />
            </svg>
            <span className="sr-only">Punktopstilling</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : ''}`}
            title="Nummereret opstilling"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h11m0 4H8m11 4H8m-4 5V6.75M4 5l.132-.274a1 1 0 0 1 .894-.551H5v2" />
            </svg>
            <span className="sr-only">Nummereret opstilling</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${editor.isActive('blockquote') ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : ''}`}
            title="Citat"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.69 12.112c0 .357-.103.708-.288 1.024l-2.802 4.802a.897.897 0 0 1-1.558-.896l2.056-3.511c-.73-.062-1.354-.459-1.821-1.111-.467-.652-.672-1.451-.623-2.304.141-2.428 2.223-4.273 4.651-4.127.354.024.64.316.64.67v5.453Zm8.31 0c0 .357-.103.708-.288 1.024l-2.802 4.802a.897.897 0 0 1-1.558-.896l2.056-3.511c-.73-.062-1.354-.459-1.821-1.111-.467-.652-.672-1.451-.623-2.304.141-2.428 2.223-4.273 4.651-4.127.354.024.64.316.64.67v5.453Z" />
            </svg>
            <span className="sr-only">Citat</span>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <button
            type="button"
            onClick={setLink}
            className={`p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 ${editor.isActive('link') ? 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white' : ''}`}
            title="Link"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m.321-4.567a3.391 3.391 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961" />
            </svg>
            <span className="sr-only">Link</span>
          </button>
          <button
            type="button"
            onClick={addImage}
            className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
            title="Billede"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M13 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-1.732.732a1 1 0 0 0 0 1.415l4.428 4.427a1 1 0 0 1-1.414 1.415l-4.429-4.427a3 3 0 0 1 0-4.243l4.429-4.427a1 1 0 1 1 1.414 1.415L11.268 10.732Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm18 10H4V6h16v10Z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">Billede</span>
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Fortryd"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4" />
            </svg>
            <span className="sr-only">Fortryd</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Gendan"
          >
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9H8a5 5 0 0 0 0 10h9m4-10-4-4m4 4-4 4" />
            </svg>
            <span className="sr-only">Gendan</span>
          </button>
        </div>
      </div>
      <div className="px-4 py-2 bg-white rounded-b-lg dark:bg-gray-800">
        <label htmlFor="wysiwyg-editor" className="sr-only">Editor</label>
        <div className="article-editor-container">
          <div className="article-editor-content">
            <EditorContent editor={editor} id="wysiwyg-editor" />
          </div>
        </div>
      </div>
      <style jsx global>{`
        .article-editor-container {
          resize: vertical;
          overflow: auto;
          min-height: 360px;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }
        .article-editor-content .ProseMirror {
          min-height: 100%;
          outline: none;
          padding: 12px;
        }
        .article-editor-content .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .article-editor-content .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .article-editor-content .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .article-editor-content .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .article-editor-content .ProseMirror li {
          margin-bottom: 0.25em;
        }
        .article-editor-content .ProseMirror li p {
          margin-bottom: 0;
        }
        .article-editor-content .ProseMirror blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1em;
          font-style: italic;
          margin: 1em 0;
          color: #4a5568;
        }
        .article-editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        .article-editor-content .ProseMirror p {
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
};

export default ArticleRichTextEditor;
