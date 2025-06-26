import React from 'react';
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
  ChevronDown
} from 'lucide-react';
import { FileNode } from '@/types';
import { useDirectoryTree } from '@/lib/hooks/useDirectoryTree';

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
  const { tree, loading, error, refetch } = useDirectoryTree();

  const toggleFolder = (folderId: string) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId]
    });
  };

  const renderDirectoryTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className={`${level > 0 ? 'ml-3' : ''}`}>
        <div
          className={`flex items-center py-2.5 px-3 text-sm hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 rounded-xl cursor-pointer transition-all duration-200 ease-in-out group ${
            selectedCategory === node.id 
              ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-r-3 border-indigo-500 shadow-sm' 
              : ''
          }`}
          onClick={() => {
            if (node.type === 'folder' && node.children) {
              toggleFolder(node.id);
            }
            setSelectedCategory(node.id);
          }}
        >
          <div className="flex items-center flex-1">
            {node.children && node.children.length > 0 ? (
              expandedFolders[node.id] ? (
                <ChevronDown className="h-4 w-4 text-slate-400 mr-2 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400 mr-2 transition-transform duration-200" />
              )
            ) : (
              <div className="w-6 mr-2"></div>
            )}
            {expandedFolders[node.id] ? (
              <FolderOpen className="h-4 w-4 text-indigo-500 mr-3 transition-colors duration-200" />
            ) : (
              <Folder className="h-4 w-4 text-slate-500 mr-3 group-hover:text-indigo-500 transition-colors duration-200" />
            )}
            <span className="text-slate-700 font-medium">{node.name}</span>
          </div>
          {node.count !== undefined && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">
              {node.count}
            </span>
          )}
        </div>
        {node.children && expandedFolders[node.id] && (
          <div className="ml-2 border-l border-slate-200 pl-1 mt-1">
            {renderDirectoryTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 h-screen shadow-sm transition-all duration-300`}>
      <div className="p-6 border-b border-slate-100">
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
      
      <nav className="px-4 py-6 space-y-2">
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

      {/* 文件目錄樹狀結構 */}
      {!isCollapsed && (
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              文件目錄
            </h3>
            <button className="p-1 hover:bg-slate-100 rounded-md transition-colors duration-200" onClick={refetch}>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <div className="space-y-1">
            {loading ? (
              <div className="text-xs text-slate-400 px-2 py-2">載入中...</div>
            ) : error ? (
              <div className="text-xs text-red-500 px-2 py-2">{error}</div>
            ) : (
              renderDirectoryTree(tree)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 