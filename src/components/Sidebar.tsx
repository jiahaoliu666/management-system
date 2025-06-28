import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Home as HomeIcon,
  BookOpen,
  Edit,
  Users,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Folder,
  FolderOpen,
  ChevronDown,
  FolderPlus,
  Trash2
} from 'lucide-react';
import { FileNode } from '@/types';
import { useDirectoryTree } from '@/lib/hooks/useDirectoryTree';
import ModalBase from './modals/ModalBase';
import { showSuccess, showError } from '@/utils/notification';
import { v4 as uuidv4 } from 'uuid';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  expandedFolders: { [key: string]: boolean };
  setExpandedFolders: (value: { [key: string]: boolean }) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  activeTab,
  setActiveTab,
  expandedFolders,
  setExpandedFolders,
  selectedCategory,
  setSelectedCategory
}) => {
  const { tree, loading, error, create, update, remove, refetch } = useDirectoryTree();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string | null } | null>(null);
  const [modal, setModal] = useState<{ type: 'create' | 'rename' | 'delete'; nodeId: string | null } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // 展開/收合狀態
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});

  // 切換展開/收合
  const toggleOpen = (id: string) => {
    setOpenFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 關閉 context menu
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [contextMenu]);

  // 右鍵事件
  const handleContextMenu = (e: React.MouseEvent, nodeId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 計算選單位置，確保不會超出視窗範圍
    const menuWidth = 160;
    const menuHeight = contextMenu?.nodeId ? 120 : 40; // 根據選項數量調整高度
    
    let x = e.clientX;
    let y = e.clientY;
    
    // 檢查右邊界
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    
    // 檢查下邊界
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    
    setContextMenu({ x, y, nodeId });
  };

  // Modal 操作
  const openCreateModal = (parentId: string | null) => {
    setInputValue('');
    setModal({ type: 'create', nodeId: parentId });
    setContextMenu(null);
  };
  const openRenameModal = (nodeId: string) => {
    const node = findNodeById(tree, nodeId);
    setInputValue(node?.name || '');
    setModal({ type: 'rename', nodeId });
    setContextMenu(null);
  };
  const openDeleteModal = (nodeId: string) => {
    setModal({ type: 'delete', nodeId });
    setContextMenu(null);
  };
  const closeModal = () => {
    setModal(null);
    setInputValue('');
  };

  // 輔助函數：尋找節點
  function findNodeById(nodes: any[], id: string): any | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  // Modal 提交
  const handleModalSubmit = async () => {
    try {
      if (modal?.type === 'create') {
        if (!inputValue.trim()) return showError('請輸入資料夾名稱');
        await create({ id: uuidv4(), name: inputValue.trim(), parentId: modal.nodeId || undefined });
        showSuccess('資料夾已建立');
      } else if (modal?.type === 'rename' && modal.nodeId) {
        if (!inputValue.trim()) return showError('請輸入新名稱');
        await update({ id: modal.nodeId, name: inputValue.trim() });
        showSuccess('資料夾已重新命名');
      } else if (modal?.type === 'delete' && modal.nodeId) {
        await remove({ id: modal.nodeId });
        showSuccess('資料夾已刪除');
      }
      closeModal();
    } catch (e: any) {
      showError(e.message || '操作失敗');
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId]
    });
  };

  // 渲染樹狀結構（UI/UX 全面優化）
  const renderDirectoryTree = (nodes: any[], level = 0) => {
    return nodes.map((node, idx) => {
      const isOpen = openFolders[node.id] ?? true;
      const hasChildren = node.children && node.children.length > 0;
      const verticalMargin = level === 0 ? 'mb-3' : 'mb-1';
      return (
        <div
          key={node.id}
          className={`group relative flex flex-col${level > 0 ? ' ml-3 border-l border-slate-100 dark:border-slate-800 pl-4' : ''} ${verticalMargin}`}
          onContextMenu={e => handleContextMenu(e, node.id)}
        >
          <div
            className={`flex items-center py-2 px-2 rounded-xl transition-all duration-150 cursor-pointer select-none
              ${level === 0
                ? 'bg-gradient-to-r from-indigo-50/80 to-white dark:from-indigo-900/30 dark:to-slate-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 hover:text-indigo-700 hover:shadow-sm dark:hover:bg-indigo-800'
                : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 hover:text-indigo-700 hover:shadow-sm dark:hover:bg-indigo-800'}
              ${selectedCategory === node.id ? 'ring-2 ring-indigo-400 dark:ring-indigo-700' : ''}`}
            style={{ minHeight: 40 }}
            onClick={e => {
              if (hasChildren) toggleOpen(node.id);
              setSelectedCategory(node.id);
            }}
          >
            {hasChildren ? (
              <button
                className="mr-1 p-1 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none hover:bg-indigo-100 dark:hover:bg-slate-700 transition"
                onClick={e => { e.stopPropagation(); toggleOpen(node.id); }}
                tabIndex={-1}
                aria-label={isOpen ? '收合' : '展開'}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="mr-5" />
            )}
            <Folder
              className={`h-5 w-5 mr-2 ${
                level === 0
                  ? 'text-indigo-500 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'
                  : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300'
              } transition-colors`}
            />
            <span
              className="flex-1 truncate text-base font-medium text-slate-800 dark:text-slate-200 select-none"
              title={node.name}
            >
              {node.name}
            </span>
          </div>
          {hasChildren && isOpen && (
            <div className={`${level === 0 ? 'mt-3' : ''}`}>
              {renderDirectoryTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 h-screen shadow-sm transition-all duration-300 flex flex-col`}>
      <div className="p-6 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center" onClick={() => setActiveTab('dashboard')}>
              <img src="/logo.png" alt="文件系統" className="h-8 w-auto cursor-pointer" />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5 text-slate-400" /> : <ChevronLeft className="h-5 w-5 text-slate-400" />}
          </button>
        </div>
      </div>
      
      <nav className="px-4 py-6 space-y-2 flex-shrink-0">
        {!isCollapsed && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm border-r-3 border-indigo-500' 
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900'
              }`}
            >
              <HomeIcon className="mr-3 h-5 w-5" />
              儀表板
            </button>
            
            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out ${
                activeTab === 'documents' 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm border-r-3 border-indigo-500' 
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              文件管理
            </button>
            
            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out ${
                activeTab === 'editor' 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm border-r-3 border-indigo-500' 
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900'
              }`}
            >
              <Edit className="mr-3 h-5 w-5" />
              文件編輯器
            </button>
            
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out ${
                activeTab === 'team' 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm border-r-3 border-indigo-500' 
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              團隊成員
            </button>
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-3 rounded-xl transition-all duration-200 ease-in-out ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900'
              }`}
            >
              <HomeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`p-3 rounded-xl transition-all duration-200 ease-in-out ${
                activeTab === 'documents' 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`p-3 rounded-xl transition-all duration-200 ease-in-out ${
                activeTab === 'editor' 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900'
              }`}
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`p-3 rounded-xl transition-all duration-200 ease-in-out ${
                activeTab === 'team' 
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="h-5 w-5" />
            </button>
          </div>
        )}
      </nav>

      {/* 文件目錄樹狀結構與空白區統一包成一個區塊，右鍵可呼叫 context menu */}
      {!isCollapsed && (
        <div 
          className="flex-1 flex flex-col px-4 pb-6 min-h-0"
          onContextMenu={e => {
            // 確保整個區塊都能觸發右鍵選單
            handleContextMenu(e, null);
          }}
        >
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              文件目錄
            </h3>
            <button className="p-1 hover:bg-slate-100 rounded-md transition-colors duration-200" onClick={refetch}>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto px-2 py-2 min-h-0"
          >
            {loading ? (
              <div className="text-center text-slate-400 py-8">載入中...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : tree.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FolderPlus className="h-10 w-10 mb-3 text-indigo-300" />
                <div className="mb-2 text-base">尚未建立任何資料夾</div>
                <button
                  className="mt-2 px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                  onClick={() => openCreateModal(null)}
                >
                  <FolderPlus className="inline h-4 w-4 mr-2" /> 新增資料夾
                </button>
                <div className="mt-4 text-xs text-slate-400">（也可於空白區右鍵新增）</div>
              </div>
            ) : (
              renderDirectoryTree(tree)
            )}
          </div>
        </div>
      )}

      {/* 右鍵選單 */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-slate-700" onClick={() => openCreateModal(contextMenu.nodeId)}>
            <FolderPlus className="inline h-4 w-4 mr-2" /> 新增資料夾
          </button>
          {contextMenu.nodeId && (
            <>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-slate-700" onClick={() => openRenameModal(contextMenu.nodeId!)}>
                <Edit className="inline h-4 w-4 mr-2" /> 重新命名
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40" onClick={() => openDeleteModal(contextMenu.nodeId!)}>
                <Trash2 className="inline h-4 w-4 mr-2" /> 刪除
              </button>
            </>
          )}
        </div>
      )}

      {/* Modal 彈窗 */}
      {modal && (
        <ModalBase
          isOpen={!!modal}
          onClose={closeModal}
          title={modal.type === 'create' ? '新增資料夾' : modal.type === 'rename' ? '重新命名資料夾' : '刪除資料夾'}
          size="sm"
        >
          {modal.type === 'delete' ? (
            <div className="space-y-6">
              <p className="text-slate-700 dark:text-slate-200">確定要刪除此資料夾嗎？此操作無法復原。</p>
              <div className="flex justify-end space-x-3">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">取消</button>
                <button onClick={handleModalSubmit} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">刪除</button>
              </div>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleModalSubmit(); }} className="space-y-6">
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-200"
                placeholder="請輸入資料夾名稱"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button onClick={closeModal} type="button" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg border border-slate-300 dark:border-slate-600">取消</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">{modal.type === 'create' ? '新增' : '儲存'}</button>
              </div>
            </form>
          )}
        </ModalBase>
      )}
    </div>
  );
};

export default Sidebar; 