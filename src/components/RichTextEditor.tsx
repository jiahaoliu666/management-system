import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Eraser,
  Palette,
  Save,
  Eye
} from 'lucide-react';
import FileUpload from './FileUpload';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  onCancel?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
  showPreview?: boolean;
  onTogglePreview?: () => void;
  toolbarRight?: React.ReactNode;
  toolbarOnly?: boolean;
  contentOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '開始編寫您的文件...',
  readOnly = false,
  className = '',
  onCancel,
  onSave,
  isSaving,
  canSave,
  showPreview,
  onTogglePreview,
  toolbarRight,
  toolbarOnly = false,
  contentOnly = false
}) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full'
        }
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-bold'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      })
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] text-slate-900 dark:text-white'
      }
    }
  });

  // 插入連結
  const insertLink = useCallback(() => {
    if (editor && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  // 插入圖片
  const insertImage = useCallback((url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // 插入表格
  const insertTable = useCallback(() => {
    if (editor) {
      const rows = prompt('請輸入表格行數 (1-10):', '3');
      const cols = prompt('請輸入表格列數 (1-10):', '3');
      
      if (rows && cols) {
        const rowCount = Math.min(Math.max(parseInt(rows), 1), 10);
        const colCount = Math.min(Math.max(parseInt(cols), 1), 10);
        
        editor.chain().focus().insertTable({ rows: rowCount, cols: colCount, withHeaderRow: true }).run();
      }
    }
  }, [editor]);

  // 處理檔案上傳成功
  const handleFileUploadSuccess = useCallback((fileUrl: string, fileName: string) => {
    insertImage(fileUrl);
    setShowFileUpload(false);
  }, [insertImage]);

  if (!editor) {
    return (
      <div className={`rich-text-editor ${className}`}>
        <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  // 只渲染工具列
  if (toolbarOnly) {
    return (
      <div className={`rich-text-editor ${className}`}>
        {/* 工具列 */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* 文字樣式 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('bold') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="粗體 (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('italic') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="斜體 (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('underline') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="底線 (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('strike') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="刪除線"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
            </div>

            {/* 標題 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('heading', { level: 1 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="標題 1"
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('heading', { level: 2 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="標題 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('heading', { level: 3 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="標題 3"
              >
                <Heading3 className="h-4 w-4" />
              </button>
            </div>

            {/* 對齊方式 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive({ textAlign: 'left' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="靠左對齊"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive({ textAlign: 'center' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="置中對齊"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive({ textAlign: 'right' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="靠右對齊"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive({ textAlign: 'justify' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="兩端對齊"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>

            {/* 清單 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('bulletList') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="無序清單"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('orderedList') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="有序清單"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </div>

            {/* 插入功能 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => setShowLinkDialog(true)}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('link') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="插入連結"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowFileUpload(true)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="插入圖片"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                onClick={insertTable}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="插入表格"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('codeBlock') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="插入程式碼區塊"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('blockquote') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="插入引用"
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>

            {/* 其他功能 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="清除格式"
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                title="復原"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                title="重做"
              >
                <Redo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onTogglePreview}
                className={`ml-1 p-2 rounded transition-colors ${showPreview ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'} hover:bg-slate-200 dark:hover:bg-slate-600`}
                title={showPreview ? '隱藏預覽' : '顯示預覽'}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
          {toolbarRight && (
            <div className="flex items-center ml-auto">{toolbarRight}</div>
          )}
        </div>
      </div>
    );
  }

  // 只渲染內容區
  if (contentOnly) {
    return (
      <div className={`rich-text-editor ${className}`}>
        {/* 編輯器內容 */}
        <div className="p-4">
          <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* 工具列 */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* 文字樣式 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('bold') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="粗體 (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('italic') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="斜體 (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('underline') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="底線 (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('strike') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="刪除線"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
            </div>

            {/* 標題 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('heading', { level: 1 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="標題 1"
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('heading', { level: 2 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="標題 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('heading', { level: 3 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="標題 3"
              >
                <Heading3 className="h-4 w-4" />
              </button>
            </div>

            {/* 對齊方式 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive({ textAlign: 'left' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="靠左對齊"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive({ textAlign: 'center' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="置中對齊"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive({ textAlign: 'right' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="靠右對齊"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive({ textAlign: 'justify' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="兩端對齊"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>

            {/* 清單 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('bulletList') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="無序清單"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('orderedList') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="有序清單"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </div>

            {/* 插入功能 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => setShowLinkDialog(true)}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('link') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="插入連結"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowFileUpload(true)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="插入圖片"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                onClick={insertTable}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="插入表格"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('codeBlock') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="插入程式碼區塊"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded transition-colors ${
                  editor.isActive('blockquote') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title="插入引用"
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>

            {/* 其他功能 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="清除格式"
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                title="復原"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50"
                title="重做"
              >
                <Redo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onTogglePreview}
                className={`ml-1 p-2 rounded transition-colors ${showPreview ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'} hover:bg-slate-200 dark:hover:bg-slate-600`}
                title={showPreview ? '隱藏預覽' : '顯示預覽'}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
          {toolbarRight && (
            <div className="flex items-center ml-auto">{toolbarRight}</div>
          )}
        </div>
      </div>

      {/* 編輯器內容 */}
      <div className="p-4">
        <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
          <EditorContent editor={editor} />
        </div>
      </div>
      {/* 操作按鈕區塊，緊貼外框下方靠右 */}
      {(onCancel || onSave) && (
        <div className="mt-4 flex justify-end gap-3" role="group" aria-label="文件操作">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors shadow"
              type="button"
            >
              <span>取消</span>
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaving || canSave === false}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg transition-colors shadow-lg"
              type="button"
            >
              <Save className="h-4 w-4" />
              <span>儲存至資料夾</span>
            </button>
          )}
        </div>
      )}

      {/* 連結對話框 */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">插入連結</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="請輸入連結網址"
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded mb-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              onKeyPress={(e) => e.key === 'Enter' && insertLink()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                插入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 檔案上傳彈窗 */}
      {showFileUpload && (
        <FileUpload
          onUploadSuccess={handleFileUploadSuccess}
          onClose={() => setShowFileUpload(false)}
          accept="image/*"
          maxSize={10}
          multiple={false}
        />
      )}
    </div>
  );
};

export default RichTextEditor; 