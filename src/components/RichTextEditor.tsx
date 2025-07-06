import React, { useCallback, useState, useEffect } from 'react';
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
  Eye,
  FileText
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
  onFileLinkSave?: (fileLink: { title: string; url: string; description: string }) => void;
  isFileLinkMode?: boolean;
  onToggleFileLinkMode?: () => void;
  fileLinkData?: { title: string; url: string; description: string };
  onFileLinkDataChange?: (data: { title: string; url: string; description: string }) => void;
  onEditorReady?: (editor: any) => void;
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
  contentOnly = false,
  onFileLinkSave,
  isFileLinkMode: externalIsFileLinkMode,
  onToggleFileLinkMode: externalToggleFileLinkMode,
  fileLinkData: externalFileLinkData,
  onFileLinkDataChange: externalFileLinkDataChange,
  onEditorReady
}) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  // 使用外部狀態或內部狀態
  const [internalIsFileLinkMode, setInternalIsFileLinkMode] = useState(false);
  const [internalFileLinkData, setInternalFileLinkData] = useState({
    title: '',
    url: '',
    description: ''
  });
  
  const isFileLinkMode = externalIsFileLinkMode !== undefined ? externalIsFileLinkMode : internalIsFileLinkMode;
  const setIsFileLinkMode = externalToggleFileLinkMode || setInternalIsFileLinkMode;
  const fileLinkData = externalFileLinkData || internalFileLinkData;
  
  // 創建一個包裝函數來處理不同的 setFileLinkData 調用方式
  const updateFileLinkData = useCallback((updater: { title: string; url: string; description: string } | ((prev: { title: string; url: string; description: string }) => { title: string; url: string; description: string })) => {
    if (externalFileLinkDataChange) {
      if (typeof updater === 'function') {
        externalFileLinkDataChange(updater(fileLinkData));
      } else {
        externalFileLinkDataChange(updater);
      }
    } else {
      if (typeof updater === 'function') {
        setInternalFileLinkData(updater);
      } else {
        setInternalFileLinkData(updater);
      }
    }
  }, [externalFileLinkDataChange, fileLinkData]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 配置 StarterKit 以支援更多格式化選項
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer'
        },
        validate: href => /^https?:\/\//.test(href)
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-sm',
          loading: 'lazy'
        },
        allowBase64: true
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 w-full my-4'
        }
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-bold text-center'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify']
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-800'
        }
      })
    ],
    content: value,
    editable: !readOnly && !isFileLinkMode,
    onUpdate: ({ editor }) => {
      // 獲取 HTML 內容並觸發變更
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] text-slate-900 dark:text-white p-4',
        spellcheck: 'true'
      }
    },
    // 解決 SSR 問題
    immediatelyRender: false
  });

  // 當編輯器準備好時，通知父組件
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // 監聽外部 value 變化，同步到編輯器
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

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

  // 切換文件連結模式
  const toggleFileLinkMode = useCallback(() => {
    setIsFileLinkMode(prev => {
      const newMode = !prev;
      // 如果切換回編輯模式，清空文件連結資料
      if (prev) {
        updateFileLinkData({ title: '', url: '', description: '' });
      }
      return newMode;
    });
  }, [updateFileLinkData]);

  // 處理文件連結儲存
  const handleFileLinkSave = useCallback(() => {
    if (!fileLinkData.url.trim()) {
      alert('請填寫文件連結網址');
      return;
    }
    
    onFileLinkSave?.(fileLinkData);
    updateFileLinkData({ title: '', url: '', description: '' });
    setIsFileLinkMode(false);
  }, [fileLinkData, onFileLinkSave, updateFileLinkData]);

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
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('bold') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="粗體 (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('italic') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="斜體 (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('underline') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="底線 (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('strike') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="刪除線"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
            </div>

            {/* 標題 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('heading', { level: 1 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="標題 1"
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('heading', { level: 2 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="標題 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('heading', { level: 3 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="標題 3"
              >
                <Heading3 className="h-4 w-4" />
              </button>
            </div>

            {/* 對齊方式 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive({ textAlign: 'left' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="靠左對齊"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive({ textAlign: 'center' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="置中對齊"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive({ textAlign: 'right' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="靠右對齊"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive({ textAlign: 'justify' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="兩端對齊"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>

            {/* 清單 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('bulletList') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="無序清單"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('orderedList') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="有序清單"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </div>

            {/* 插入功能 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => setShowLinkDialog(true)}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('link') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入連結"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowFileUpload(true)}
                disabled={isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入圖片"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                onClick={insertTable}
                disabled={isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入表格"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('codeBlock') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入程式碼區塊"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('blockquote') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入引用"
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>

            {/* 其他功能 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                disabled={isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="清除格式"
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo() || isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50 ${isFileLinkMode ? 'cursor-not-allowed' : ''}`}
                title="復原"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo() || isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50 ${isFileLinkMode ? 'cursor-not-allowed' : ''}`}
                title="重做"
              >
                <Redo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onTogglePreview}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && showPreview 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={showPreview ? '隱藏預覽' : '顯示預覽'}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {toolbarRight && (
              <div className="flex items-center ml-auto">{toolbarRight}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 只渲染內容區
  if (contentOnly) {
    return (
      <div className={`rich-text-editor ${className}`}>
        {/* 編輯器內容 */}
        {isFileLinkMode ? (
          // 文件連結模式
          <div className="min-h-[180px]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  文件連結 <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={fileLinkData.url}
                  onChange={(e) => updateFileLinkData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="請貼上 OneDrive 或其他儲存連結"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  文件描述
                </label>
                <textarea
                  value={fileLinkData.description}
                  onChange={(e) => updateFileLinkData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="請輸入文件描述（選填）"
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        ) : (
          // 文字編輯模式
          <div className="min-h-[500px]">
            <EditorContent editor={editor} />
          </div>
        )}
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
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('bold') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="粗體 (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('italic') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="斜體 (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('underline') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="底線 (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('strike') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="刪除線"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
            </div>

            {/* 標題 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('heading', { level: 1 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="標題 1"
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('heading', { level: 2 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="標題 2"
              >
                <Heading2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('heading', { level: 3 }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="標題 3"
              >
                <Heading3 className="h-4 w-4" />
              </button>
            </div>

            {/* 對齊方式 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive({ textAlign: 'left' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="靠左對齊"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive({ textAlign: 'center' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="置中對齊"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive({ textAlign: 'right' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="靠右對齊"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive({ textAlign: 'justify' }) 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="兩端對齊"
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>

            {/* 清單 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('bulletList') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="無序清單"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('orderedList') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="有序清單"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </div>

            {/* 插入功能 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button
                onClick={() => setShowLinkDialog(true)}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('link') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入連結"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowFileUpload(true)}
                disabled={isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入圖片"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                onClick={insertTable}
                disabled={isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入表格"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('codeBlock') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入程式碼區塊"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && editor.isActive('blockquote') 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="插入引用"
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>

            {/* 其他功能 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                disabled={isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="清除格式"
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo() || isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50 ${isFileLinkMode ? 'cursor-not-allowed' : ''}`}
                title="復原"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo() || isFileLinkMode}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-50 ${isFileLinkMode ? 'cursor-not-allowed' : ''}`}
                title="重做"
              >
                <Redo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onTogglePreview}
                disabled={isFileLinkMode}
                className={`p-2 rounded transition-colors ${
                  !isFileLinkMode && showPreview 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={showPreview ? '隱藏預覽' : '顯示預覽'}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {toolbarRight && (
              <div className="flex items-center ml-auto">{toolbarRight}</div>
            )}
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      {isFileLinkMode ? (
        // 文件連結模式
        <div className="p-4">
          <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  文件連結 <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={fileLinkData.url}
                  onChange={(e) => updateFileLinkData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="請貼上 OneDrive 或其他儲存連結"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  文件描述
                </label>
                <textarea
                  value={fileLinkData.description}
                  onChange={(e) => updateFileLinkData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="請輸入文件描述（選填）"
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 文字編輯模式
        <div className="p-4">
          <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}
      
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