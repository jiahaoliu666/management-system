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
  Plus
} from 'lucide-react';
import { useDirectoryTree } from '@/lib/hooks/useDirectoryTree';
import { useFileOptions } from '@/lib/hooks/useFileOptions';
import { fileApi } from '@/lib/api/apiClient';
import { showSuccess, showError, showInfo } from '@/utils/notification';
import { Document, Version } from '@/types';
import { useFileEditor } from '@/lib/hooks/useFileEditor';
import FolderSelector from './modals/FolderSelector';
import { DEFAULT_CATEGORIES, DEFAULT_TAGS } from '@/utils/constants';

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

const FileEditor: React.FC<FileEditorProps> = ({ documentId, onClose, onSave }) => {
  const [state, setState] = useState<EditorState>({
    title: '',
    content: '',
    category: DEFAULT_CATEGORIES[0],
    tags: [DEFAULT_TAGS[0]],
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

  // 處理下載
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.title || '未命名文件'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('文件已下載');
  };

  // 處理預覽
  const handlePreview = () => {
    showInfo('預覽功能開發中');
  };

  const handleFolderSelect = (folderId: string, folderName: string) => {
    setState(prev => ({
      ...prev,
      selectedFolderId: folderId,
      selectedFolderName: folderName
    }));
  };

  const handleSaveToFolder = async () => {
    try {
      setState(prev => ({ ...prev, isSaving: true }));
      
      // 創建或更新文件，包含資料夾資訊
      if (documentId) {
        // 更新現有文件
        await fileApi.update({
          id: documentId,
          name: state.title,
          content: state.content,
          parentId: state.selectedFolderId === 'root' ? undefined : state.selectedFolderId,
          category: state.category,
          tags: state.tags
        });
      } else {
        // 創建新文件
        const newId = `doc_${Date.now()}`;
        await fileApi.create({
          id: newId,
          name: state.title,
          parentId: state.selectedFolderId === 'root' ? undefined : state.selectedFolderId,
          s3Key: `documents/${newId}.json`,
          fileType: 'document',
          content: state.content,
          category: state.category,
          tags: state.tags
        });
      }
      
      showSuccess(`文件已儲存至 ${state.selectedFolderName}`);
      setState(prev => ({ ...prev, isDirty: false, isSaving: false }));
    } catch (error) {
      showError('儲存失敗');
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
    handleTagsChange(state.tags.filter(tag => tag !== tagToRemove));
  };

  // 新增：重設所有欄位
  const handleReset = () => {
    setState({
      title: '',
      content: '',
      category: DEFAULT_CATEGORIES[0],
      tags: [DEFAULT_TAGS[0]],
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
  };

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
              <span className={state.category ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                {state.category || '選擇分類'}
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
                          placeholder="添加分類"
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
              <span className={state.tags.length > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                {state.tags.length > 0 ? state.tags.join('、') : '選擇標籤'}
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
                          >
                            <span>{tag}</span>
                            <span className="ml-2 text-indigo-400">×</span>
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
                          placeholder="添加標籤"
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
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">標題</label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="輸入文件標題"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      {/* 第三列：編輯區域 */}
      <div className="flex-1 p-4">
        <textarea
          ref={textareaRef}
          value={state.content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="開始編寫您的文件..."
          style={{ minHeight: '400px' }}
        />
      </div>
      {/* 第四列：取消、儲存至資料夾按鈕 */}
      <div className="p-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors shadow"
          type="button"
        >
          <span>取消</span>
        </button>
        <button
          onClick={handleSaveToFolder}
          disabled={state.isSaving || !state.title.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg transition-colors shadow-lg"
          type="button"
        >
          <Save className="h-4 w-4" />
          <span>儲存至資料夾</span>
        </button>
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