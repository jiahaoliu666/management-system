import React, { useState, useEffect, useRef } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useDirectoryTree } from '@/lib/hooks/useDirectoryTree';

interface FolderSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string, folderName: string) => void;
  currentFolderId?: string;
}

interface FolderNode {
  id: string;
  name: string;
  children: FolderNode[];
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentFolderId
}) => {
  const { tree, loading } = useDirectoryTree();
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolderId || 'root');

  // hooks 一定要在最上面
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // 初始化展開狀態
  useEffect(() => {
    if (tree.length > 0) {
      const initialExpanded: { [key: string]: boolean } = {};
      // 展開所有頂層資料夾
      tree.forEach(folder => {
        initialExpanded[folder.id] = true;
      });
      setExpandedFolders(initialExpanded);
    }
  }, [tree]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleFolderSelect = (folderId: string, folderName: string) => {
    setSelectedFolderId(folderId);
  };

  const handleConfirm = () => {
    const selectedFolder = findFolderById(tree, selectedFolderId);
    if (selectedFolder) {
      onSelect(selectedFolderId, selectedFolder.name);
    } else {
      onSelect('root', '根目錄');
    }
    onClose();
  };

  const findFolderById = (folders: FolderNode[], id: string): FolderNode | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.children.length > 0) {
        const found = findFolderById(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderFolderTree = (folders: FolderNode[], level = 0): React.ReactNode => {
    return folders.map(folder => {
      const isExpanded = expandedFolders[folder.id] || false;
      const hasChildren = folder.children.length > 0;
      const isSelected = selectedFolderId === folder.id;

      return (
        <div key={folder.id} className="select-none">
          <div
            className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => handleFolderSelect(folder.id, folder.name)}
          >
            {hasChildren ? (
              <button
                className="mr-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="mr-6" />
            )}
            
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 mr-2 text-indigo-500" />
            ) : (
              <Folder className="h-4 w-4 mr-2 text-slate-500" />
            )}
            
            <span className="flex-1 truncate">{folder.name}</span>
            
            {isSelected && (
              <Check className="h-4 w-4 text-indigo-600" />
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-2">
              {renderFolderTree(folder.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* 標題 */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            選擇目標資料夾
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            選擇要儲存文件的資料夾位置
          </p>
        </div>

        {/* 內容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-slate-600">載入中...</span>
            </div>
          ) : (
            <div className="space-y-1">
              {/* 根目錄選項 */}
              <div
                className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFolderId === 'root'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => handleFolderSelect('root', '根目錄')}
              >
                <Folder className="h-4 w-4 mr-2 text-slate-500" />
                <span className="flex-1">根目錄</span>
                {selectedFolderId === 'root' && (
                  <Check className="h-4 w-4 text-indigo-600" />
                )}
              </div>
              
              {/* 資料夾樹狀結構 */}
              {renderFolderTree(tree)}
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            確認選擇
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderSelector; 