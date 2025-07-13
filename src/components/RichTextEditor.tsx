import React, { useCallback, useState, useEffect, useRef } from 'react';
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
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Blockquote from '@tiptap/extension-blockquote';
import BoldExtension from '@tiptap/extension-bold';
import ItalicExtension from '@tiptap/extension-italic';
import StrikeExtension from '@tiptap/extension-strike';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Heading } from '@tiptap/extension-heading';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
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
  FileText,
  X,
  Highlighter,
  Indent,
  Outdent
} from 'lucide-react';
import FileUpload from './FileUpload';
import { showError } from '@/utils/notification';

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
  editorInstance?: any; // 新增: 可傳入 editor 實例
}

// 擴充段落/標題，允許 style 屬性
const IndentParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style') || null,
        renderHTML: attributes => {
          return attributes.style ? { style: attributes.style } : {};
        },
      },
    };
  },
});

const IndentHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style') || null,
        renderHTML: attributes => {
          return attributes.style ? { style: attributes.style } : {};
        },
      },
    };
  },
});

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
  onEditorReady,
  editorInstance // 新增
}) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  
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

  // 1. 工具列 roving tabindex 狀態
  const [toolbarFocusIdx, setToolbarFocusIdx] = useState<number>(-1);
  const toolbarButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const toolbarButtonCount = 24; // 更新按鈕數量（移除兩端對齊按鈕後，索引0-23）

  // 2. 工具列鍵盤操作
  const handleToolbarKeyDown = (e: React.KeyboardEvent) => {
    if (toolbarFocusIdx === -1) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (toolbarFocusIdx + 1) % toolbarButtonCount;
      setToolbarFocusIdx(next);
      toolbarButtonRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (toolbarFocusIdx - 1 + toolbarButtonCount) % toolbarButtonCount;
      setToolbarFocusIdx(prev);
      toolbarButtonRefs.current[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setToolbarFocusIdx(0);
      toolbarButtonRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setToolbarFocusIdx(toolbarButtonCount - 1);
      toolbarButtonRefs.current[toolbarButtonCount - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setToolbarFocusIdx(-1);
      // focus 回編輯區
      const editorEl = document.querySelector('[data-testid="tiptap-editor"]') as HTMLElement | null;
      editorEl?.focus();
    }
  };

  // 3. 工具列 sticky
  const toolbarStickyClass = 'sticky top-0 z-20 bg-slate-50 dark:bg-slate-700';

  // 4. 工具列按鈕點擊自動 focus 編輯區
  const focusEditor = () => {
    const editorEl = document.querySelector('[data-testid="tiptap-editor"]') as HTMLElement | null;
    editorEl?.focus();
  };

  // 只初始化 editor，如果未傳入 editorInstance
  const editor = editorInstance || useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
        heading: false,
        bold: false,
        italic: false,
        strike: false
      }),
      IndentParagraph,
      IndentHeading,
      BoldExtension,
      ItalicExtension,
      StrikeExtension,
      Underline.configure({
        HTMLAttributes: {
          class: 'underline'
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
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left'
      }),
      TextStyle,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-800'
        }
      }),
      Color,
      HorizontalRule,
      Blockquote,
    ],
    content: value || '<p><br></p>',
    editable: !readOnly && !isFileLinkMode,
    immediatelyRender: true, // React 19/18 官方建議，立即渲染
    shouldRerenderOnTransaction: false, // React 19/18 官方建議，僅必要時重渲染
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[400px] text-slate-900 dark:text-white p-4',
        spellcheck: 'true',
        placeholder: placeholder,
        'data-testid': 'tiptap-editor'
      }
    },
    onCreate: ({ editor }) => {
      if (onEditorReady) onEditorReady(editor);
    },
    onFocus: ({ editor }) => {
      // 當編輯器準備好時，通知父組件
      useEffect(() => {
        if (editor && onEditorReady) {
          onEditorReady(editor);
        }
      }, [editor, onEditorReady]);

      // 同步內容變更
      useEffect(() => {
        if (editor && value !== editor.getHTML()) {
          editor.commands.setContent(value || '<p><br></p>', false);
        }
      }, [editor, value]);

      // 插入連結
      const insertLink = useCallback(() => {
        if (editor && editor.isEditable && linkUrl) {
          editor.chain().focus().setLink({ href: linkUrl }).run();
          setLinkUrl('');
          setShowLinkDialog(false);
        }
      }, [editor, linkUrl]);

      // 插入圖片
      const insertImage = useCallback((url: string) => {
        if (editor && editor.isEditable) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }, [editor]);

      // 插入表格
      const insertTable = useCallback(() => {
        if (editor && editor.isEditable) {
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

      // 檢查是否有選取的文字
      const hasSelection = useCallback(() => {
        return editor && !editor.state.selection.empty;
      }, [editor]);

      // 檢查是否有選取的文字或游標在可格式化的位置
      const canApplyFormat = useCallback(() => {
        if (!editor) return false;
        const { selection } = editor.state;
        return !selection.empty || editor.isActive('paragraph') || editor.isActive('heading');
      }, [editor]);

      // 處理顏色變更
      const handleColorChange = useCallback((color: string) => {
        setSelectedColor(color);
        if (editor && editor.isEditable && hasSelection()) {
          console.log('Setting color:', color);
          editor.chain().focus().setColor(color).run();
        } else if (editor && editor.isEditable) {
          showError('請先選取要變更顏色的文字');
        }
      }, [editor, hasSelection]);

      // 格式化按鈕點擊處理器
      const handleFormatClick = useCallback((command: () => void) => {
        if (!editor || !editor.isEditable || isFileLinkMode) {
          return;
        }
        try {
          command();
        } catch (error) {
          console.error('Format command error:', error);
          showError('格式化操作失敗');
        }
      }, [editor, isFileLinkMode]);

      // 插入功能點擊處理器
      const handleInsertClick = useCallback((command: () => void) => {
        if (!editor || !editor.isEditable || isFileLinkMode) {
          return;
        }

        try {
          command();
        } catch (error) {
          console.error('Insert command error:', error);
          showError('插入操作失敗');
        }
      }, [editor, isFileLinkMode]);

      // 工具列按鈕點擊處理器
      const handleToolbarClick = useCallback((command: () => void) => {
        if (editor && editor.isEditable && !isFileLinkMode) {
          try {
            console.log('Executing TipTap command');
            command();
            console.log('TipTap command executed successfully');
          } catch (error) {
            console.error('TipTap command error:', error);
          }
        } else {
          console.log('Editor not ready:', { 
            editor: !!editor, 
            isEditable: editor?.isEditable, 
            isFileLinkMode 
          });
        }
      }, [editor, isFileLinkMode]);

      // 確保編輯器已初始化
      useEffect(() => {
        if (editor) {
          console.log('TipTap editor initialized:', {
            editor: editor,
            isEditable: editor.isEditable,
            isEmpty: editor.isEmpty,
            content: editor.getHTML()
          });
        } else {
          console.log('TipTap editor not initialized yet');
        }
      }, [editor]);

      // 直接執行編輯器命令的函數
      const executeCommand = useCallback((command: () => void) => {
        if (editor && editor.isEditable && !isFileLinkMode) {
          try {
            command();
          } catch (error) {
            console.error('TipTap command error:', error);
          }
        }
      }, [editor, isFileLinkMode]);
    }
  });

  // 當編輯器準備好時，通知父組件
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // 同步內容變更
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p><br></p>', false);
    }
  }, [editor, value]);

  // 插入連結
  const insertLink = useCallback(() => {
    if (editor && editor.isEditable && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  // 插入圖片
  const insertImage = useCallback((url: string) => {
    if (editor && editor.isEditable) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // 插入表格
  const insertTable = useCallback(() => {
    if (editor && editor.isEditable) {
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

  // 檢查是否有選取的文字
  const hasSelection = useCallback(() => {
    return editor && !editor.state.selection.empty;
  }, [editor]);

  // 檢查是否有選取的文字或游標在可格式化的位置
  const canApplyFormat = useCallback(() => {
    if (!editor) return false;
    const { selection } = editor.state;
    return !selection.empty || editor.isActive('paragraph') || editor.isActive('heading');
  }, [editor]);

  // 處理顏色變更
  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
    if (editor && editor.isEditable && hasSelection()) {
      console.log('Setting color:', color);
      editor.chain().focus().setColor(color).run();
    } else if (editor && editor.isEditable) {
      showError('請先選取要變更顏色的文字');
    }
  }, [editor, hasSelection]);

  // 格式化按鈕點擊處理器
  const handleFormatClick = useCallback((command: () => void) => {
    if (!editor || !editor.isEditable || isFileLinkMode) {
      return;
    }
    try {
      command();
    } catch (error) {
      console.error('Format command error:', error);
      showError('格式化操作失敗');
    }
  }, [editor, isFileLinkMode]);

  // 插入功能點擊處理器
  const handleInsertClick = useCallback((command: () => void) => {
    if (!editor || !editor.isEditable || isFileLinkMode) {
      return;
    }

    try {
      command();
    } catch (error) {
      console.error('Insert command error:', error);
      showError('插入操作失敗');
    }
  }, [editor, isFileLinkMode]);

  // 工具列按鈕點擊處理器
  const handleToolbarClick = useCallback((command: () => void) => {
    if (editor && editor.isEditable && !isFileLinkMode) {
      try {
        console.log('Executing TipTap command');
        command();
        console.log('TipTap command executed successfully');
      } catch (error) {
        console.error('TipTap command error:', error);
      }
    } else {
      console.log('Editor not ready:', { 
        editor: !!editor, 
        isEditable: editor?.isEditable, 
        isFileLinkMode 
      });
    }
  }, [editor, isFileLinkMode]);

  // 確保編輯器已初始化
  useEffect(() => {
    if (editor) {
      console.log('TipTap editor initialized:', {
        editor: editor,
        isEditable: editor.isEditable,
        isEmpty: editor.isEmpty,
        content: editor.getHTML()
      });
    } else {
      console.log('TipTap editor not initialized yet');
    }
  }, [editor]);

  // 直接執行編輯器命令的函數
  const executeCommand = useCallback((command: () => void) => {
    if (editor && editor.isEditable && !isFileLinkMode) {
      try {
        command();
      } catch (error) {
        console.error('TipTap command error:', error);
      }
    }
  }, [editor, isFileLinkMode]);

  // 重新實現縮排功能 - 使用更簡潔可靠的方法
  const handleIndent = useCallback(() => {
    if (!editor || !editor.isEditable) {
      return;
    }
    
    try {
      // 使用 TipTap 的標準方法處理縮排
      editor.chain().focus().command(({ tr, dispatch, state }: { tr: any; dispatch: any; state: any }) => {
        const { selection } = state;
        const { $from, $to } = selection;
        let changed = false;
        
        // 遍歷選取範圍內的所有區塊節點
        state.doc.nodesBetween($from.pos, $to.pos, (node: any, pos: number) => {
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const currentStyle = node.attrs.style || '';
            const currentIndent = parseInt(currentStyle.match(/margin-left:\s*(\d+)em/)?.[1] || '0');
            const newIndent = Math.min(currentIndent + 1, 5);
            
            // 構建新的 style 屬性
            let newStyle = currentStyle.replace(/margin-left:\s*\d+em;?\s*/, '');
            if (newIndent > 0) {
              newStyle = newStyle + `margin-left: ${newIndent}em;`;
            }
            
            // 更新節點屬性
            tr.setNodeMarkup(pos, undefined, { 
              ...node.attrs, 
              style: newStyle.trim() || undefined 
            });
            changed = true;
          }
        });
        
        if (changed && dispatch) {
          dispatch(tr);
        }
        return changed;
      }).run();
      
      // 確保焦點回到編輯器
      setTimeout(() => {
        const editorEl = document.querySelector('[data-testid="tiptap-editor"]') as HTMLElement;
        if (editorEl) {
          editorEl.focus();
        }
      }, 0);
      
    } catch (error) {
      console.error('縮排操作失敗:', error);
    }
  }, [editor]);

  const handleOutdent = useCallback(() => {
    if (!editor || !editor.isEditable) {
      return;
    }
    
    try {
      // 使用 TipTap 的標準方法處理減少縮排
      editor.chain().focus().command(({ tr, dispatch, state }: { tr: any; dispatch: any; state: any }) => {
        const { selection } = state;
        const { $from, $to } = selection;
        let changed = false;
        
        // 遍歷選取範圍內的所有區塊節點
        state.doc.nodesBetween($from.pos, $to.pos, (node: any, pos: number) => {
          if (node.type.name === 'paragraph' || node.type.name === 'heading') {
            const currentStyle = node.attrs.style || '';
            const currentIndent = parseInt(currentStyle.match(/margin-left:\s*(\d+)em/)?.[1] || '0');
            const newIndent = Math.max(currentIndent - 1, 0);
            
            // 構建新的 style 屬性
            let newStyle = currentStyle.replace(/margin-left:\s*\d+em;?\s*/, '');
            if (newIndent > 0) {
              newStyle = newStyle + `margin-left: ${newIndent}em;`;
            }
            
            // 更新節點屬性
            tr.setNodeMarkup(pos, undefined, { 
              ...node.attrs, 
              style: newStyle.trim() || undefined 
            });
            changed = true;
          }
        });
        
        if (changed && dispatch) {
          dispatch(tr);
        }
        return changed;
      }).run();
      
      // 確保焦點回到編輯器
      setTimeout(() => {
        const editorEl = document.querySelector('[data-testid="tiptap-editor"]') as HTMLElement;
        if (editorEl) {
          editorEl.focus();
        }
      }, 0);
      
    } catch (error) {
      console.error('減少縮排操作失敗:', error);
    }
  }, [editor]);

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
        <div
          role="toolbar"
          aria-label="富文字編輯工具列"
          aria-controls="tiptap-editor-main"
          tabIndex={0}
          className={`flex flex-wrap gap-2 items-center justify-between ${toolbarStickyClass}`}
          onKeyDown={handleToolbarKeyDown}
          onFocus={() => setToolbarFocusIdx(0)}
          onBlur={() => setToolbarFocusIdx(-1)}
        >
          <div className="flex flex-wrap gap-2">
            {/* 標題群組 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              {/* 標題 */}
              {[1,2,3].map((level, idx) => (
                <button
                  key={level}
                  ref={el => { toolbarButtonRefs.current[idx] = el; }}
                  tabIndex={toolbarFocusIdx === idx ? 0 : -1}
                  aria-label={`標題 ${level}`}
                  aria-pressed={editor.isActive('heading', { level })}
                  aria-disabled={isFileLinkMode}
                  onClick={() => { handleFormatClick(() => editor.chain().focus().toggleHeading({ level }).run()); focusEditor(); }}
                  onFocus={() => setToolbarFocusIdx(idx)}
                  className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('heading', { level }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {level === 1 ? <Heading1 className="h-4 w-4" /> : level === 2 ? <Heading2 className="h-4 w-4" /> : <Heading3 className="h-4 w-4" />}
                </button>
              ))}
            </div>
            {/* 文字格式群組 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button 
                ref={el => { toolbarButtonRefs.current[3] = el; }}
                tabIndex={toolbarFocusIdx === 3 ? 0 : -1}
                aria-label="粗體"
                aria-pressed={editor.isActive('bold')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleBold().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(3)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('bold') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="粗體 (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[4] = el; }}
                tabIndex={toolbarFocusIdx === 4 ? 0 : -1}
                aria-label="斜體"
                aria-pressed={editor.isActive('italic')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleItalic().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(4)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('italic') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="斜體 (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[5] = el; }}
                tabIndex={toolbarFocusIdx === 5 ? 0 : -1}
                aria-label="底線"
                aria-pressed={editor.isActive('underline')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleUnderline().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(5)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('underline') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="底線 (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[6] = el; }}
                tabIndex={toolbarFocusIdx === 6 ? 0 : -1}
                aria-label="刪除線"
                aria-pressed={editor.isActive('strike')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleStrike().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(6)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('strike') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="刪除線 (Ctrl+Shift+S)"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
            </div>
            {/* 顏色/背景色 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <input 
                type="color" 
                title="文字顏色 - 需要選取文字" 
                className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer" 
                value={selectedColor}
                onChange={e => handleColorChange(e.target.value)} 
              />
              <button 
                ref={el => { toolbarButtonRefs.current[7] = el; }}
                tabIndex={toolbarFocusIdx === 7 ? 0 : -1}
                aria-label="移除文字顏色"
                aria-pressed={!editor.isActive('color')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().unsetColor().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(7)}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600" 
                title="移除文字顏色 - 需要選取文字"
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[8] = el; }}
                tabIndex={toolbarFocusIdx === 8 ? 0 : -1}
                aria-label="螢光標記"
                aria-pressed={editor.isActive('highlight')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleHighlight().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(8)}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${editor.isActive('highlight') ? 'bg-yellow-200 dark:bg-yellow-800' : ''}`} 
                title="螢光標記 - 需要選取文字"
              >
                <Highlighter className="h-4 w-4" />
              </button>
            </div>
            {/* 對齊/縮排 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button 
                ref={el => { toolbarButtonRefs.current[9] = el; }}
                tabIndex={toolbarFocusIdx === 9 ? 0 : -1}
                aria-label="靠左對齊"
                aria-pressed={editor.isActive({ textAlign: 'left' })}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().setTextAlign('left').run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(9)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="靠左對齊"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[10] = el; }}
                tabIndex={toolbarFocusIdx === 10 ? 0 : -1}
                aria-label="置中對齊"
                aria-pressed={editor.isActive({ textAlign: 'center' })}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().setTextAlign('center').run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(10)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="置中對齊"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[11] = el; }}
                tabIndex={toolbarFocusIdx === 11 ? 0 : -1}
                aria-label="靠右對齊"
                aria-pressed={editor.isActive({ textAlign: 'right' })}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().setTextAlign('right').run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(11)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="靠右對齊"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[12] = el; }}
                tabIndex={toolbarFocusIdx === 12 ? 0 : -1}
                aria-label="縮排"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => handleIndent()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(12)}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-indigo-500" 
                title="縮排"
              >
                <Indent className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[13] = el; }}
                tabIndex={toolbarFocusIdx === 13 ? 0 : -1}
                aria-label="減少縮排"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => handleOutdent()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(13)}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-indigo-500" 
                title="減少縮排"
              >
                <Outdent className="h-4 w-4" />
              </button>
            </div>
            {/* 清單/表格/分隔線 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button 
                ref={el => { toolbarButtonRefs.current[14] = el; }}
                tabIndex={toolbarFocusIdx === 14 ? 0 : -1}
                aria-label="無序清單"
                aria-pressed={editor.isActive('bulletList')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleBulletList().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(14)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="無序清單"
              >
                <List className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[15] = el; }}
                tabIndex={toolbarFocusIdx === 15 ? 0 : -1}
                aria-label="有序清單"
                aria-pressed={editor.isActive('orderedList')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleOrderedList().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(15)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="有序清單"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[16] = el; }}
                tabIndex={toolbarFocusIdx === 16 ? 0 : -1}
                aria-label="插入表格"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleInsertClick(() => insertTable()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(16)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="插入表格"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[17] = el; }}
                tabIndex={toolbarFocusIdx === 17 ? 0 : -1}
                aria-label="插入分隔線"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleInsertClick(() => editor.chain().focus().setHorizontalRule().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(17)}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600" 
                title="插入分隔線"
              >
                <hr className="w-4 border-t-2 border-slate-400 inline-block align-middle" />
              </button>
            </div>
            {/* 插入功能 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button 
                ref={el => { toolbarButtonRefs.current[18] = el; }}
                tabIndex={toolbarFocusIdx === 18 ? 0 : -1}
                aria-label="插入連結"
                aria-disabled={isFileLinkMode}
                onClick={() => { setShowLinkDialog(true); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(18)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('link') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="插入連結"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[19] = el; }}
                tabIndex={toolbarFocusIdx === 19 ? 0 : -1}
                aria-label="插入圖片"
                aria-disabled={isFileLinkMode}
                onClick={() => { setShowFileUpload(true); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(19)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="插入圖片"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[20] = el; }}
                tabIndex={toolbarFocusIdx === 20 ? 0 : -1}
                aria-label="插入引用"
                aria-pressed={editor.isActive('blockquote')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleBlockquote().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(20)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="插入引用"
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>
            {/* 其他功能 */}
            <div className="flex items-center gap-1">
              <button 
                ref={el => { toolbarButtonRefs.current[21] = el; }}
                tabIndex={toolbarFocusIdx === 21 ? 0 : -1}
                aria-label="清除格式"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().unsetAllMarks().clearNodes().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(21)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="清除格式 - 需要選取文字"
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[22] = el; }}
                tabIndex={toolbarFocusIdx === 22 ? 0 : -1}
                aria-label="復原"
                aria-disabled={!editor.can().undo() || isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().undo().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(22)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${isFileLinkMode ? 'cursor-not-allowed' : ''}`} 
                title="復原"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[23] = el; }}
                tabIndex={toolbarFocusIdx === 23 ? 0 : -1}
                aria-label="重做"
                aria-disabled={!editor.can().redo() || isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().redo().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(23)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${isFileLinkMode ? 'cursor-not-allowed' : ''}`} 
                title="重做"
              >
                <Redo className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[24] = el; }}
                tabIndex={toolbarFocusIdx === 24 ? 0 : -1}
                aria-label={showPreview ? '隱藏預覽' : '顯示預覽'}
                aria-pressed={showPreview}
                aria-disabled={isFileLinkMode}
                onClick={onTogglePreview} 
                onFocus={() => setToolbarFocusIdx(24)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && showPreview ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
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
            <EditorContent
              editor={editor}
              id="tiptap-editor-main"
              role="textbox"
              aria-multiline="true"
              aria-label="文件內容編輯區"
              data-testid="tiptap-editor"
              tabIndex={0}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* 工具列 */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
        <div
          role="toolbar"
          aria-label="富文字編輯工具列"
          aria-controls="tiptap-editor-main"
          tabIndex={0}
          className={`flex flex-wrap gap-2 items-center justify-between ${toolbarStickyClass}`}
          onKeyDown={handleToolbarKeyDown}
          onFocus={() => setToolbarFocusIdx(0)}
          onBlur={() => setToolbarFocusIdx(-1)}
        >
          <div className="flex flex-wrap gap-2">
            {/* 標題群組 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              {/* 標題 */}
              {[1,2,3].map((level, idx) => (
                <button
                  key={level}
                  ref={el => { toolbarButtonRefs.current[idx] = el; }}
                  tabIndex={toolbarFocusIdx === idx ? 0 : -1}
                  aria-label={`標題 ${level}`}
                  aria-pressed={editor.isActive('heading', { level })}
                  aria-disabled={isFileLinkMode}
                  onClick={() => { handleFormatClick(() => editor.chain().focus().toggleHeading({ level }).run()); focusEditor(); }}
                  onFocus={() => setToolbarFocusIdx(idx)}
                  className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('heading', { level }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {level === 1 ? <Heading1 className="h-4 w-4" /> : level === 2 ? <Heading2 className="h-4 w-4" /> : <Heading3 className="h-4 w-4" />}
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />
            {/* 文字格式群組 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button 
                ref={el => { toolbarButtonRefs.current[3] = el; }}
                tabIndex={toolbarFocusIdx === 3 ? 0 : -1}
                aria-label="粗體"
                aria-pressed={editor.isActive('bold')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleBold().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(3)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('bold') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="粗體 (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[4] = el; }}
                tabIndex={toolbarFocusIdx === 4 ? 0 : -1}
                aria-label="斜體"
                aria-pressed={editor.isActive('italic')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleItalic().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(4)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('italic') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="斜體 (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[5] = el; }}
                tabIndex={toolbarFocusIdx === 5 ? 0 : -1}
                aria-label="底線"
                aria-pressed={editor.isActive('underline')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleUnderline().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(5)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('underline') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="底線 (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[6] = el; }}
                tabIndex={toolbarFocusIdx === 6 ? 0 : -1}
                aria-label="刪除線"
                aria-pressed={editor.isActive('strike')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleStrike().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(6)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('strike') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="刪除線 (Ctrl+Shift+S)"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
            </div>
            {/* 顏色/背景色 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <input 
                type="color" 
                title="文字顏色 - 需要選取文字" 
                className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer" 
                value={selectedColor}
                onChange={e => handleColorChange(e.target.value)} 
              />
              <button 
                ref={el => { toolbarButtonRefs.current[7] = el; }}
                tabIndex={toolbarFocusIdx === 7 ? 0 : -1}
                aria-label="移除文字顏色"
                aria-pressed={!editor.isActive('color')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().unsetColor().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(7)}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600" 
                title="移除文字顏色 - 需要選取文字"
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[8] = el; }}
                tabIndex={toolbarFocusIdx === 8 ? 0 : -1}
                aria-label="螢光標記"
                aria-pressed={editor.isActive('highlight')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleHighlight().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(8)}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 ${editor.isActive('highlight') ? 'bg-yellow-200 dark:bg-yellow-800' : ''}`} 
                title="螢光標記 - 需要選取文字"
              >
                <Highlighter className="h-4 w-4" />
              </button>
            </div>
            {/* 對齊/縮排 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button 
                ref={el => { toolbarButtonRefs.current[9] = el; }}
                tabIndex={toolbarFocusIdx === 9 ? 0 : -1}
                aria-label="靠左對齊"
                aria-pressed={editor.isActive({ textAlign: 'left' })}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().setTextAlign('left').run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(9)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="靠左對齊"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[10] = el; }}
                tabIndex={toolbarFocusIdx === 10 ? 0 : -1}
                aria-label="置中對齊"
                aria-pressed={editor.isActive({ textAlign: 'center' })}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().setTextAlign('center').run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(10)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="置中對齊"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[11] = el; }}
                tabIndex={toolbarFocusIdx === 11 ? 0 : -1}
                aria-label="靠右對齊"
                aria-pressed={editor.isActive({ textAlign: 'right' })}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().setTextAlign('right').run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(11)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="靠右對齊"
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[12] = el; }}
                tabIndex={toolbarFocusIdx === 12 ? 0 : -1}
                aria-label="縮排"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => handleIndent()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(12)}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-indigo-500" 
                title="縮排"
              >
                <Indent className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[13] = el; }}
                tabIndex={toolbarFocusIdx === 13 ? 0 : -1}
                aria-label="減少縮排"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => handleOutdent()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(13)}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-indigo-500" 
                title="減少縮排"
              >
                <Outdent className="h-4 w-4" />
              </button>
            </div>
            {/* 清單/表格/分隔線 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button 
                ref={el => { toolbarButtonRefs.current[14] = el; }}
                tabIndex={toolbarFocusIdx === 14 ? 0 : -1}
                aria-label="無序清單"
                aria-pressed={editor.isActive('bulletList')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleBulletList().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(14)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="無序清單"
              >
                <List className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[15] = el; }}
                tabIndex={toolbarFocusIdx === 15 ? 0 : -1}
                aria-label="有序清單"
                aria-pressed={editor.isActive('orderedList')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleOrderedList().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(15)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="有序清單"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[16] = el; }}
                tabIndex={toolbarFocusIdx === 16 ? 0 : -1}
                aria-label="插入表格"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleInsertClick(() => insertTable()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(16)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="插入表格"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[17] = el; }}
                tabIndex={toolbarFocusIdx === 17 ? 0 : -1}
                aria-label="插入分隔線"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleInsertClick(() => editor.chain().focus().setHorizontalRule().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(17)}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600" 
                title="插入分隔線"
              >
                <hr className="w-4 border-t-2 border-slate-400 inline-block align-middle" />
              </button>
            </div>
            {/* 插入功能 */}
            <div className="flex items-center gap-1 border-r border-slate-300 dark:border-slate-600 pr-2">
              <button 
                ref={el => { toolbarButtonRefs.current[18] = el; }}
                tabIndex={toolbarFocusIdx === 18 ? 0 : -1}
                aria-label="插入連結"
                aria-disabled={isFileLinkMode}
                onClick={() => { setShowLinkDialog(true); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(18)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('link') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="插入連結"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[19] = el; }}
                tabIndex={toolbarFocusIdx === 19 ? 0 : -1}
                aria-label="插入圖片"
                aria-disabled={isFileLinkMode}
                onClick={() => { setShowFileUpload(true); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(19)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="插入圖片"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[20] = el; }}
                tabIndex={toolbarFocusIdx === 20 ? 0 : -1}
                aria-label="插入引用"
                aria-pressed={editor.isActive('blockquote')}
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().toggleBlockquote().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(20)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="插入引用"
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>
            {/* 其他功能 */}
            <div className="flex items-center gap-1">
              <button 
                ref={el => { toolbarButtonRefs.current[21] = el; }}
                tabIndex={toolbarFocusIdx === 21 ? 0 : -1}
                aria-label="清除格式"
                aria-disabled={isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().unsetAllMarks().clearNodes().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(21)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
                title="清除格式 - 需要選取文字"
              >
                <Eraser className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[22] = el; }}
                tabIndex={toolbarFocusIdx === 22 ? 0 : -1}
                aria-label="復原"
                aria-disabled={!editor.can().undo() || isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().undo().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(22)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${isFileLinkMode ? 'cursor-not-allowed' : ''}`} 
                title="復原"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[23] = el; }}
                tabIndex={toolbarFocusIdx === 23 ? 0 : -1}
                aria-label="重做"
                aria-disabled={!editor.can().redo() || isFileLinkMode}
                onClick={() => { handleFormatClick(() => editor.chain().focus().redo().run()); focusEditor(); }}
                onFocus={() => setToolbarFocusIdx(23)}
                className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${isFileLinkMode ? 'cursor-not-allowed' : ''}`} 
                title="重做"
              >
                <Redo className="h-4 w-4" />
              </button>
              <button 
                ref={el => { toolbarButtonRefs.current[24] = el; }}
                tabIndex={toolbarFocusIdx === 24 ? 0 : -1}
                aria-label={showPreview ? '隱藏預覽' : '顯示預覽'}
                aria-pressed={showPreview}
                aria-disabled={isFileLinkMode}
                onClick={onTogglePreview} 
                onFocus={() => setToolbarFocusIdx(24)}
                className={`p-2 rounded transition-colors focus:ring-2 focus:ring-indigo-500 ${!isFileLinkMode && showPreview ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-600'} ${isFileLinkMode ? 'opacity-50 cursor-not-allowed' : ''}`} 
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
            <EditorContent
              editor={editor}
              id="tiptap-editor-main"
              role="textbox"
              aria-multiline="true"
              aria-label="文件內容編輯區"
              data-testid="tiptap-editor"
              tabIndex={0}
            />
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