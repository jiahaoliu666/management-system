import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Save, 
  Download, 
  Share2, 
  History, 
  Eye, 
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Tag,
  MoreHorizontal,
  Folder,
  ChevronDown,
  Plus,
  Edit,
  Link
} from 'lucide-react';
import { useDirectoryTree } from '@/lib/hooks/useDirectoryTree';
import { useFileOptions } from '@/lib/hooks/useFileOptions';
import { fileApi } from '@/lib/api/apiClient';
import { showSuccess, showError, showInfo } from '@/utils/notification';
import { Document, Version } from '@/types';
import { useFileEditor } from '@/lib/hooks/useFileEditor';
import FolderSelector from './modals/FolderSelector';
import RichTextEditor from './RichTextEditor';
import { DEFAULT_CATEGORIES, DEFAULT_TAGS } from '@/utils/constants';
import apiClient from '@/lib/api/apiClient';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BoldExtension from '@tiptap/extension-bold';
import ItalicExtension from '@tiptap/extension-italic';
import StrikeExtension from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import TiptapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Blockquote from '@tiptap/extension-blockquote';

interface FileEditorProps {
  documentId?: string;
  onClose?: () => void;
  onSave?: (document: Document) => void;
}

interface EditorState {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  selectedFolderId: string;
  selectedFolderName: string;
}

// 計算文字數量的工具函數
const calculateTextCount = (htmlContent: string): { characters: number; words: number } => {
  if (!htmlContent) {
    return { characters: 0, words: 0 };
  }
  
  // 檢查是否在瀏覽器環境中
  if (typeof window === 'undefined') {
    return { characters: 0, words: 0 };
  }
  
  // 創建臨時 DOM 元素來解析 HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // 獲取純文字內容
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // 計算字元數（包含空格）
  const characters = textContent.length;
  
  // 計算字數（以空格分隔）
  const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  
  return { characters, words };
};

const FileEditor: React.FC<FileEditorProps> = ({ documentId, onClose, onSave }) => {
  const DEFAULT_TAG = DEFAULT_TAGS[0];
  const [state, setState] = useState<EditorState>({
    title: '',
    content: '',
    category: DEFAULT_CATEGORIES[0],
    tags: [DEFAULT_TAG],
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    autoSaveEnabled: true,
    selectedFolderId: 'root',
    selectedFolderName: '根目錄'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<Version[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowComments: true,
    allowEditing: false,
    expiresAt: null as Date | null
  });

  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFileLinkMode, setIsFileLinkMode] = useState(false);
  const [fileLinkData, setFileLinkData] = useState({
    title: '',
    url: '',
    description: ''
  });
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const {
    document: documentData,
    content,
    title: documentTitle,
    category: documentCategory,
    tags: documentTags,
    isDirty: documentIsDirty,
    isSaving: documentIsSaving,
    isLoading,
    lastSaved: documentLastSaved,
    autoSaveEnabled: documentAutoSaveEnabled,
    saveDocument,
    updateContent,
    updateTitle,
    updateCategory,
    updateTags,
    toggleAutoSave,
    loadDocument
  } = useFileEditor({
    documentId,
    onSave,
    onError: (error) => showError(error)
  });

  // 計算文字數量
  const textCount = calculateTextCount(content);

  const { tree: directoryTree } = useDirectoryTree();
  const { categories, tags: availableTags, loading: optionsLoading } = useFileOptions();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // 自動調整文字區域高度
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [content, adjustTextareaHeight]);

  // 同步狀態
  useEffect(() => {
    setState(prev => ({
      ...prev,
      title: documentTitle,
      content,
      category: documentCategory,
      tags: documentTags,
      isDirty: documentIsDirty,
      isSaving: documentIsSaving,
      lastSaved: documentLastSaved,
      autoSaveEnabled: documentAutoSaveEnabled
    }));
  }, [documentTitle, content, documentCategory, documentTags, documentIsDirty, documentIsSaving, documentLastSaved, documentAutoSaveEnabled]);

  // 處理儲存
  const handleSave = async () => {
    await saveDocument(true);
  };

  // 處理內容變更
  const handleContentChange = (newContent: string) => {
    updateContent(newContent);
  };

  // 處理標題變更
  const handleTitleChange = (newTitle: string) => {
    updateTitle(newTitle);
  };

  // 處理標籤變更
  const handleTagsChange = (newTags: string[]) => {
    updateTags(newTags);
  };

  // 處理分類變更
  const handleCategoryChange = (newCategory: string) => {
    updateCategory(newCategory);
  };

  // 處理分類選擇
  const handleCategorySelect = (selectedCategory: string) => {
    handleCategoryChange(selectedCategory);
    setShowCategoryDropdown(false);
    setCustomCategory('');
  };

  // 處理自定義分類
  const handleCustomCategory = () => {
    if (customCategory.trim()) {
      handleCategoryChange(customCategory.trim());
      setShowCategoryDropdown(false);
      setCustomCategory('');
    }
  };

  // 處理標籤選擇
  const handleTagSelect = (selectedTag: string) => {
    if (!state.tags.includes(selectedTag)) {
      handleTagsChange([...state.tags, selectedTag]);
    }
    setShowTagDropdown(false);
    setCustomTag('');
  };

  // 處理自定義標籤
  const handleCustomTag = () => {
    if (customTag.trim() && !state.tags.includes(customTag.trim())) {
      handleTagsChange([...state.tags, customTag.trim()]);
      setShowTagDropdown(false);
      setCustomTag('');
    }
  };

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 處理鍵盤快捷鍵
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'b':
          e.preventDefault();
          // 粗體功能
          break;
        case 'i':
          e.preventDefault();
          // 斜體功能
          break;
      }
    }
    if (e.key === 'Enter' && e.target === textareaRef.current) {
      handleAddTag();
    }
  };

  // 處理分享
  const handleShare = () => {
    setShowShareModal(true);
  };

  // 處理版本歷史
  const handleVersionHistory = () => {
    setShowVersionHistory(true);
  };

  // 切換文件連結模式
  const toggleFileLinkMode = useCallback(() => {
    if (!isFileLinkMode) {
      // 切換到文件連結模式前，檢查是否有內容
      const { characters } = calculateTextCount(content);
      if (characters > 0) {
        const hasContent = confirm(`檢測到文字編輯區域有內容（${characters} 個字元），切換到文件連結模式將會清空當前內容。確定要繼續嗎？`);
        if (!hasContent) {
          return;
        }
      }
      
      // 先重置編輯器狀態，清除所有格式和選擇
      if (editorInstance) {
        // 清除所有格式和內容
        editorInstance.chain().focus().unsetAllMarks().clearNodes().setContent('').run();
        // 確保游標在開始位置
        editorInstance.chain().focus().setTextSelection(0).run();
      }
      
      // 立即清空內容狀態
      updateContent('');
      setIsFileLinkMode(true);
    } else {
      // 切換回編輯模式
      setIsFileLinkMode(false);
      setFileLinkData({ title: '', url: '', description: '' });
    }
  }, [isFileLinkMode, content, editorInstance, updateContent]);

  // 處理文件連結儲存
  const handleFileLinkSave = useCallback((fileLink: { title: string; url: string; description: string }) => {
    if (!state.selectedFolderId) {
      showError('請選擇要儲存的資料夾');
      return;
    }

    if (!fileLink.url.trim()) {
      showError('請輸入文件連結');
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const documentId = `link_${Date.now()}`;
      const fileName = fileLink.url.split('/').pop() || '外部文件連結';
      
      // 創建文件連結記錄
      fileApi.create({
        id: documentId,
        name: fileName,
        parentId: state.selectedFolderId,
        s3Key: `links/${documentId}.json`,
        fileType: 'link',
        content: JSON.stringify({
          url: fileLink.url,
          description: fileLink.description,
          type: 'external_link'
        }),
        category: '外部連結',
        tags: ['連結', '外部文件']
      }).then(() => {
        showSuccess('文件連結已成功儲存');
        onSave?.({
          id: documentId,
          title: fileName,
          category: '外部連結',
          subcategory: '',
          lastModified: new Date().toISOString(),
          author: '',
          status: 'active',
          priority: 'medium',
          tags: ['連結', '外部文件'],
          permissions: ['read', 'write'],
          fileType: 'link',
          size: 0,
          views: 0,
          downloads: 0,
          comments: 0,
          versions: []
        });
        setFileLinkData({ title: '', url: '', description: '' });
        setIsFileLinkMode(false);
      }).catch((error: any) => {
        showError(error.response?.data?.error || '儲存文件連結失敗');
      }).finally(() => {
        setState(prev => ({ ...prev, isSaving: false }));
      });
    } catch (error: any) {
      showError(error.response?.data?.error || '儲存文件連結失敗');
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state.selectedFolderId, onSave]);

  // 處理編輯器準備完成
  const handleEditorReady = useCallback((editor: any) => {
    setEditorInstance(editor);
  }, []);

  // 處理文件連結模式的儲存
  const handleFileLinkModeSave = useCallback(() => {
    if (!state.selectedFolderId) {
      showError('請選擇要儲存的資料夾');
      return;
    }

    if (!fileLinkData.url.trim()) {
      showError('請輸入文件連結');
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const documentId = `link_${Date.now()}`;
      const fileName = fileLinkData.url.split('/').pop() || '外部文件連結';
      
      // 創建文件連結記錄
      fileApi.create({
        id: documentId,
        name: fileName,
        parentId: state.selectedFolderId,
        s3Key: `links/${documentId}.json`,
        fileType: 'link',
        content: JSON.stringify({
          url: fileLinkData.url,
          description: fileLinkData.description,
          type: 'external_link'
        }),
        category: '外部連結',
        tags: ['連結', '外部文件']
      }).then(() => {
        showSuccess('文件連結已成功儲存');
        onSave?.({
          id: documentId,
          title: fileName,
          category: '外部連結',
          subcategory: '',
          lastModified: new Date().toISOString(),
          author: '',
          status: 'active',
          priority: 'medium',
          tags: ['連結', '外部文件'],
          permissions: ['read', 'write'],
          fileType: 'link',
          size: 0,
          views: 0,
          downloads: 0,
          comments: 0,
          versions: []
        });
        setFileLinkData({ title: '', url: '', description: '' });
        setIsFileLinkMode(false);
      }).catch((error: any) => {
        showError(error.response?.data?.error || '儲存文件連結失敗');
      }).finally(() => {
        setState(prev => ({ ...prev, isSaving: false }));
      });
    } catch (error: any) {
      showError(error.response?.data?.error || '儲存文件連結失敗');
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state.selectedFolderId, fileLinkData, onSave]);

  // 處理下載
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle || '未命名文件'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('文件已下載');
  };

  // 處理預覽按鈕
  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleFolderSelect = (folderId: string, folderName: string) => {
    setState(prev => ({
      ...prev,
      selectedFolderId: folderId,
      selectedFolderName: folderName
    }));
  };

  // 新：呼叫 API 檢查 S3 是否有同名檔案
  const checkS3FileExists = async (s3Key: string) => {
    try {
      const res = await apiClient.post('/api/check-s3-file-exists', { s3Key });
      return res.data.exists;
    } catch (err) {
      showError('檢查檔案名稱時發生錯誤');
      return false;
    }
  };

  const handleSaveToFolder = async () => {
    if (!state.selectedFolderId) {
      showError('請選擇要儲存的資料夾');
      return;
    }

    if (!documentTitle.trim()) {
      showError('請輸入文件標題');
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const currentDocId = documentId || `doc_${Date.now()}`;
      // 產生安全的檔案名稱
      const safeName = documentTitle.trim().replace(/[^a-zA-Z0-9-_\.]/g, '_').slice(0, 64);
      const fileExt = '.json';
      const s3FileName = safeName.endsWith(fileExt) ? safeName : safeName + fileExt;
      const s3ObjectKey = `documents/${s3FileName}`;

      // 新：呼叫 API 檢查 S3 是否有同名檔案
      if (!documentId) {
        const exists = await checkS3FileExists(s3ObjectKey);
        if (exists) {
          showError('已有相同檔案名稱，請更改標題名稱再儲存');
          setState(prev => ({ ...prev, isSaving: false }));
          return;
        }
      }

      // 準備儲存資料
      const saveData = {
        id: currentDocId,
        name: documentTitle.trim(),
        content: content,
        parentId: state.selectedFolderId,
        category: documentCategory || '文件',
        tags: documentTags.length > 0 ? documentTags : ['一般文件'],
        fileType: 'document',
        s3Key: s3ObjectKey
      };
      
      if (documentId) {
        // 更新現有文件
        await fileApi.update(saveData);
      } else {
        // 創建新文件
        await fileApi.create(saveData);
      }

      showSuccess('文件已成功儲存');
      // 儲存成功後自動重置所有欄位
      handleReset();
    } catch (error: any) {
      showError(error.response?.data?.error || '儲存失敗');
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };

  // 新增標籤
  const handleAddTag = () => {
    if (currentTag.trim() && !state.tags.includes(currentTag.trim())) {
      handleTagsChange([...state.tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // 移除標籤
  const handleRemoveTag = (tagToRemove: string) => {
    // 僅當有多於一個標籤時才允許移除「一般文件」
    if (tagToRemove === DEFAULT_TAG && state.tags.length === 1) return;
    if (tagToRemove === DEFAULT_TAG && state.tags.length === 2 && state.tags.includes(DEFAULT_TAG)) {
      // 僅剩兩個標籤且其中一個是「一般文件」，移除後只剩一個
      setState(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
      return;
    }
    if (state.tags.length > 1 || tagToRemove !== DEFAULT_TAG) {
      setState(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    }
  };

  // 新增：重設所有欄位
  const handleReset = () => {
    // 重置 useFileEditor hook 中的狀態
    updateContent('');
    updateTitle('');
    updateCategory(DEFAULT_CATEGORIES[0]);
    updateTags([DEFAULT_TAG]);
    
    // 重置本地狀態
    setState({
      title: '',
      content: '',
      category: DEFAULT_CATEGORIES[0],
      tags: [DEFAULT_TAG],
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      autoSaveEnabled: true,
      selectedFolderId: 'root',
      selectedFolderName: '根目錄'
    });
    setCurrentTag('');
    setCustomCategory('');
    setCustomTag('');
    
    // 重置編輯器實例
    if (editorInstance) {
      editorInstance.chain().focus().unsetAllMarks().clearNodes().setContent('').run();
    }
    
    // 重置文件連結模式
    setIsFileLinkMode(false);
    setFileLinkData({ title: '', url: '', description: '' });
  };

  // 新增一個簡單的 PreviewContent 元件，僅渲染 HTML
  const PreviewContent: React.FC<{ content: string }> = ({ content }) => (
    <div className="p-4">
      <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
        <div
          className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto min-h-[400px] text-slate-900 dark:text-white"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );

  // 建立唯一的 editor 實例
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false, strike: false }),
      BoldExtension,
      ItalicExtension,
      StrikeExtension,
      Underline.configure({ HTMLAttributes: { class: 'underline' } }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer' },
        validate: (href: string) => /^https?:\/\//.test(href)
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg shadow-sm', loading: 'lazy' },
        allowBase64: true
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'border-collapse border border-gray-300 w-full my-4' }
      }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-bold text-center' } }),
      TableCell.configure({ HTMLAttributes: { class: 'border border-gray-300 px-4 py-2' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'], defaultAlignment: 'left' }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true, HTMLAttributes: { class: 'bg-yellow-200 dark:bg-yellow-800' } }),
      HorizontalRule,
      Blockquote
    ],
    content: content || '<p><br></p>',
    editable: !isFileLinkMode,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateContent(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[400px] text-slate-900 dark:text-white p-4',
        spellcheck: 'true',
        placeholder: '開始編寫您的文件...',
        'data-testid': 'tiptap-editor'
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-slate-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg h-full flex flex-col">
      {/* 第一列：分類、標籤、上傳至 */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-0 relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">分類</label>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <span className={documentCategory ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                {documentCategory || '選擇分類'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {optionsLoading ? (
                  <div className="p-3 text-center text-sm text-slate-500">
                    載入中...
                  </div>
                ) : (
                  <>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        >
                          {category}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-sm text-slate-500">
                        暫無分類選項
                      </div>
                    )}
                    <div className="border-t border-slate-200 dark:border-slate-600 p-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCustomCategory()}
                          placeholder="添加新分類"
                          className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={handleCustomCategory}
                          className="px-2 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 relative" ref={tagDropdownRef}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">標籤</label>
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <span className="text-slate-900 dark:text-white">
                {(documentTags && documentTags.length > 0 ? documentTags : [DEFAULT_TAG]).join('、')}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showTagDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {optionsLoading ? (
                  <div className="p-3 text-center text-sm text-slate-500">
                    載入中...
                  </div>
                ) : (
                  <>
                    {/* 可選標籤列表 */}
                    {availableTags.filter(tag => !state.tags.includes(tag)).length > 0 ? (
                      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {availableTags.filter(tag => !state.tags.includes(tag)).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagSelect(tag)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {/* 已選取標籤列表（button 樣式） */}
                    {state.tags.length > 0 && (
                      <div className="border-t border-slate-200 dark:border-slate-600">
                        <div className="p-2 text-xs text-slate-500 dark:text-slate-400">已選取標籤</div>
                        {state.tags.map((tag, index) => (
                          <button
                            key={tag}
                            onClick={() => handleRemoveTag(tag)}
                            className="w-full text-left px-3 py-2 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex justify-between items-center"
                            disabled={tag === DEFAULT_TAG && state.tags.length === 1}
                            style={tag === DEFAULT_TAG && state.tags.length === 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            <span>{tag}</span>
                            {(tag !== DEFAULT_TAG || state.tags.length > 1) && (
                              <span className="ml-2 text-indigo-400">×</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* 無可用標籤且無已選取標籤時顯示 */}
                    {availableTags.filter(tag => !state.tags.includes(tag)).length === 0 && state.tags.length === 0 && (
                      <div className="p-3 text-center text-sm text-slate-500">暫無可用標籤</div>
                    )}
                    <div className="border-t border-slate-200 dark:border-slate-600 p-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={customTag}
                          onChange={(e) => setCustomTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCustomTag()}
                          placeholder="添加新標籤"
                          className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={handleCustomTag}
                          className="px-2 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">上傳至</label>
            <button
              onClick={() => setShowFolderSelector(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <div className="flex items-center space-x-2">
                <Folder className="h-4 w-4" />
                <span className="truncate">{state.selectedFolderName}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {/* 第二列：標題 */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">標題</label>
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="輸入文件標題"
          onKeyDown={handleKeyDown}
        />
      </div>
      {/* 工具列 + 編輯/預覽區域合併為同一容器，僅保留一條分隔線，圓角只在外層 */}
      <div className="p-4">
        <div className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
          {/* 工具列 */}
          <div className="p-3 bg-slate-50 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <RichTextEditor
                value={content}
                onChange={handleContentChange}
                placeholder="開始編寫您的文件..."
                className="h-full"
                onCancel={handleReset}
                onSave={isFileLinkMode ? handleFileLinkModeSave : handleSaveToFolder}
                isSaving={documentIsSaving}
                canSave={isFileLinkMode ? !!fileLinkData.url.trim() : !!documentTitle.trim()}
                showPreview={showPreview}
                onTogglePreview={handleTogglePreview}
                onFileLinkSave={handleFileLinkSave}
                toolbarOnly={true}
                isFileLinkMode={isFileLinkMode}
                onToggleFileLinkMode={toggleFileLinkMode}
                fileLinkData={fileLinkData}
                onFileLinkDataChange={setFileLinkData}
                onEditorReady={handleEditorReady}
                editorInstance={editor}
              />
              {/* 切換文件連結模式按鈕 */}
              <button
                onClick={toggleFileLinkMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isFileLinkMode
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500'
                }`}
                title={isFileLinkMode ? '切換回文字編輯模式' : '切換到文件連結模式'}
              >
                <Link className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {isFileLinkMode ? '切換回文字編輯模式' : '切換到文件連結模式'}
                </span>
              </button>
            </div>
          </div>
          {/* 編輯區域和預覽區域 */}
          <div className="px-3 py-2 relative">
            {showPreview ? (
              isFileLinkMode ? (
                // 文件連結模式下顯示 RichTextEditor 的文件連結表單
                <RichTextEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="開始編寫您的文件..."
                  className="h-full"
                  onCancel={handleReset}
                  onSave={handleFileLinkModeSave}
                  isSaving={documentIsSaving}
                  canSave={!!fileLinkData.url.trim()}
                  showPreview={showPreview}
                  onTogglePreview={handleTogglePreview}
                  onFileLinkSave={handleFileLinkSave}
                  contentOnly={true}
                  isFileLinkMode={isFileLinkMode}
                  onToggleFileLinkMode={toggleFileLinkMode}
                  fileLinkData={fileLinkData}
                  onFileLinkDataChange={setFileLinkData}
                  onEditorReady={handleEditorReady}
                  editorInstance={editor}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                  {/* 左半部：編輯區域 */}
                  <div className="pr-4 relative">
                    <RichTextEditor
                      value={content}
                      onChange={handleContentChange}
                      placeholder="開始編寫您的文件..."
                      className="h-full"
                      onCancel={handleReset}
                      onSave={isFileLinkMode ? handleFileLinkModeSave : handleSaveToFolder}
                      isSaving={documentIsSaving}
                      canSave={isFileLinkMode ? !!fileLinkData.url.trim() : !!documentTitle.trim()}
                      showPreview={showPreview}
                      onTogglePreview={handleTogglePreview}
                      onFileLinkSave={handleFileLinkSave}
                      contentOnly={true}
                      onEditorReady={handleEditorReady}
                      editorInstance={editor}
                    />
                    {!isFileLinkMode && (
                      <div className="absolute bottom-1 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-700/80 px-2 py-1 rounded-md backdrop-blur-sm">
                        {textCount.characters} 字元
                      </div>
                    )}
                  </div>
                  {/* 右半部：預覽區域 */}
                  <div className="border-l border-slate-200 dark:border-slate-600 pl-4">
                    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none text-slate-900 dark:text-white min-h-[500px]">
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="relative">
                <RichTextEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="開始編寫您的文件..."
                  className="h-full"
                  onCancel={handleReset}
                  onSave={isFileLinkMode ? handleFileLinkModeSave : handleSaveToFolder}
                  isSaving={documentIsSaving}
                  canSave={isFileLinkMode ? !!fileLinkData.url.trim() : !!documentTitle.trim()}
                  showPreview={showPreview}
                  onTogglePreview={handleTogglePreview}
                  onFileLinkSave={handleFileLinkSave}
                  contentOnly={true}
                  isFileLinkMode={isFileLinkMode}
                  onToggleFileLinkMode={toggleFileLinkMode}
                  fileLinkData={fileLinkData}
                  onFileLinkDataChange={setFileLinkData}
                  onEditorReady={handleEditorReady}
                  editorInstance={editor}
                />
                {!isFileLinkMode && (
                  <div className="absolute bottom-1 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-700/80 px-2 py-1 rounded-md backdrop-blur-sm">
                    {textCount.characters} 字元
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 操作按鈕區塊 - 移到容器外部 */}
      <div className="px-4">
        <div className="flex justify-end gap-3" role="group" aria-label="文件操作">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors shadow"
            type="button"
          >
            <span>取消</span>
          </button>
          <button
            onClick={isFileLinkMode ? handleFileLinkModeSave : handleSaveToFolder}
            disabled={
              documentIsSaving ||
              (isFileLinkMode
                ? !fileLinkData.url.trim()
                : !documentTitle.trim() || !content || content.replace(/<[^>]+>/g, '').trim().length === 0)
            }
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg transition-colors shadow-lg"
            type="button"
          >
            <span>儲存至資料夾</span>
          </button>
        </div>
      </div>
      {/* 資料夾選擇器 */}
      <FolderSelector
        isOpen={showFolderSelector}
        onClose={() => setShowFolderSelector(false)}
        onSelect={handleFolderSelect}
        currentFolderId={state.selectedFolderId}
      />
    </div>
  );
};

export default FileEditor; 