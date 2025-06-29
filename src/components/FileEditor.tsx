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
  ChevronDown
} from 'lucide-react';
import { useDirectoryTree } from '@/lib/hooks/useDirectoryTree';
import { fileApi } from '@/lib/api/apiClient';
import { showSuccess, showError, showInfo } from '@/utils/notification';
import { Document, Version } from '@/types';
import { useFileEditor } from '@/lib/hooks/useFileEditor';
import FileEditorSettings from './FileEditorSettings';
import FolderSelector from './FolderSelector';

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
    category: '',
    tags: [],
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          parentId: state.selectedFolderId === 'root' ? undefined : state.selectedFolderId
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
          content: state.content
        });
      }
      
      showSuccess(`文件已儲存至 ${state.selectedFolderName}`);
      setState(prev => ({ ...prev, isDirty: false, isSaving: false }));
    } catch (error) {
      showError('儲存失敗');
      setState(prev => ({ ...prev, isSaving: false }));
    }
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
      {/* 文件資訊 */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              標題
            </label>
            <input
              type="text"
              value={state.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="輸入文件標題"
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              分類
            </label>
            <select
              value={state.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={handleKeyDown}
            >
              <option value="document">文件</option>
              <option value="code">程式碼</option>
              <option value="note">筆記</option>
              <option value="report">報告</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              標籤
            </label>
            <div className="flex flex-wrap gap-2">
              {state.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 min-w-0 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="新增標籤"
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              上傳至
            </label>
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

      {/* 編輯區域 */}
      <div className="flex-1 p-4 relative">
        <textarea
          ref={textareaRef}
          value={state.content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="開始編寫您的文件..."
          style={{ minHeight: '400px' }}
        />
        
        {/* 儲存按鈕 - 右下角 */}
        <div className="absolute bottom-6 right-6">
          <button
            onClick={handleSaveToFolder}
            disabled={state.isSaving || !state.title.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg transition-colors shadow-lg"
          >
            <Save className="h-4 w-4" />
            <span>儲存至資料夾</span>
          </button>
        </div>
      </div>

      {/* 設定模態框 */}
      <FileEditorSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={{
          autoSave: state.autoSaveEnabled,
          autoSaveInterval: 30000,
          theme: 'auto',
          fontSize: 14,
          fontFamily: 'Inter',
          lineHeight: 1.6,
          showLineNumbers: false,
          wordWrap: true,
          spellCheck: true
        }}
        onSettingsChange={(settings) => {
          toggleAutoSave(settings.autoSave);
        }}
      />

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