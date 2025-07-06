import { useState, useEffect, useRef, useCallback } from 'react';
import { fileApi } from '@/lib/api/apiClient';
import { Document } from '@/types';
import { showSuccess, showError } from '@/utils/notification';

interface FileEditorState {
  document: Document | null;
  content: string;
  title: string;
  category: string;
  tags: string[];
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
}

interface UseFileEditorOptions {
  documentId?: string;
  autoSaveInterval?: number;
  onSave?: (document: Document) => void;
  onError?: (error: string) => void;
}

// 默認分類
const DEFAULT_CATEGORY = '文件';

export const useFileEditor = (options: UseFileEditorOptions = {}) => {
  const {
    documentId,
    autoSaveInterval = 30000,
    onSave,
    onError
  } = options;

  const [state, setState] = useState<FileEditorState>({
    document: null,
    content: '',
    title: '',
    category: DEFAULT_CATEGORY,
    tags: [],
    isDirty: false,
    isSaving: false,
    isLoading: false,
    lastSaved: null,
    autoSaveEnabled: true
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 載入文件
  const loadDocument = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fileApi.get(id);
      const data = response.data;
      
      setState(prev => ({
        ...prev,
        document: {
          id: data.id,
          title: data.name || '',
          category: data.category || data.fileType || DEFAULT_CATEGORY,
          subcategory: '',
          lastModified: data.updatedAt || data.createdAt || '',
          author: data.createdBy || '',
          status: 'active',
          priority: 'medium',
          tags: data.tags || [],
          permissions: ['read', 'write'],
          fileType: data.fileType || 'document',
          size: 0,
          views: 0,
          downloads: 0,
          comments: 0,
          versions: []
        },
        content: data.content || '',
        title: data.name || '',
        category: data.category || data.fileType || DEFAULT_CATEGORY,
        tags: data.tags || [],
        isDirty: false,
        isLoading: false,
        lastSaved: data.updatedAt ? new Date(data.updatedAt) : null
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error.response?.data?.error || error.message || '載入文件失敗';
      showError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError]);

  // 儲存文件
  const saveDocument = useCallback(async (force = false) => {
    if (!force && !state.isDirty) return;

    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const documentIdToUse = state.document?.id || documentId;
      
      if (documentIdToUse) {
        // 更新現有文件
        await fileApi.update({
          id: documentIdToUse,
          name: state.title,
          content: state.content
        });
      } else {
        // 創建新文件
        const newId = `doc_${Date.now()}`;
        await fileApi.create({
          id: newId,
          name: state.title || '未命名文件',
          parentId: 'root',
          s3Key: `documents/${newId}.json`,
          fileType: 'document',
          content: state.content,
          category: state.category || DEFAULT_CATEGORY
        });
        
        // 重新載入文件以獲取完整資料
        await loadDocument(newId);
        return;
      }

      const updatedDocument = {
        ...state.document!,
        title: state.title,
        lastModified: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        document: updatedDocument,
        isDirty: false,
        isSaving: false,
        lastSaved: new Date()
      }));

      showSuccess('文件已儲存');
      onSave?.(updatedDocument);
    } catch (error: any) {
      setState(prev => ({ ...prev, isSaving: false }));
      const errorMessage = error.response?.data?.error || error.message || '儲存文件失敗';
      showError(errorMessage);
      onError?.(errorMessage);
    }
  }, [state, documentId, onSave, onError, loadDocument]);

  // 更新內容
  const updateContent = useCallback((newContent: string) => {
    setState(prev => ({
      ...prev,
      content: newContent,
      isDirty: true
    }));
  }, []);

  // 更新標題
  const updateTitle = useCallback((newTitle: string) => {
    setState(prev => ({
      ...prev,
      title: newTitle.trim(),
      isDirty: true
    }));
  }, []);

  // 更新分類
  const updateCategory = useCallback((newCategory: string) => {
    setState(prev => ({
      ...prev,
      category: newCategory.trim(),
      isDirty: true
    }));
  }, []);

  // 更新標籤
  const updateTags = useCallback((newTags: string[]) => {
    // 確保至少有一個標籤
    const validTags = newTags.filter(tag => tag.trim().length > 0);
    if (validTags.length === 0) {
      validTags.push('一般文件');
    }
    
    setState(prev => ({
      ...prev,
      tags: validTags,
      isDirty: true
    }));
  }, []);

  // 切換自動儲存
  const toggleAutoSave = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, autoSaveEnabled: enabled }));
  }, []);

  // 初始化載入
  useEffect(() => {
    if (documentId) {
      loadDocument(documentId);
    }
  }, [documentId, loadDocument]);

  // 清理自動儲存計時器
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    saveDocument,
    updateContent,
    updateTitle,
    updateCategory,
    updateTags,
    toggleAutoSave,
    loadDocument
  };
}; 