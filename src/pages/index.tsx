import { useState } from 'react'
import { TopHeader } from '@/components/management-system/TopHeader'
import { FileTree } from '@/components/management-system/FileTree'
import { FileList } from '@/components/management-system/FileList'
import ActivityPanel from '@/components/management-system/ActivityPanel'
import ContextMenu from '@/components/management-system/ContextMenu'
import StatsCards from '@/components/management-system/StatsCards'
import Breadcrumb from '@/components/management-system/Breadcrumb'
import { treeData } from '@/data/mock-data'
import type { File, Folder } from '@/types/management'
import { Activity, Upload, Plus, Download, Trash2, RefreshCw } from 'lucide-react'

export default function Home() {
  const [expandedFolders, setExpandedFolders] = useState(['root', 'ops', 'dev'])
  const [selectedFolderId, setSelectedFolderId] = useState('aws')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number; item: File | Folder } | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'author'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [showUserPanel, setShowUserPanel] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)

  // 獲取當前資料夾的檔案
  const getCurrentFolderFiles = () => {
    const findFolder = (nodes: (File | Folder)[], id: string): Folder | null => {
      for (const node of nodes) {
        if (node.id === id) return node as Folder
        if ('children' in node && node.children) {
          const found = findFolder(node.children, id)
          if (found) return found
        }
      }
      return null
    }

    const folder = findFolder(treeData, selectedFolderId)
    if (folder && folder.children) {
      let files = folder.children.filter(child => !('children' in child)) as File[]
      
      // 搜尋過濾
      if (searchQuery) {
        files = files.filter(file => 
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // 排序
      files.sort((a, b) => {
        let aVal, bVal
        switch (sortBy) {
          case 'name': aVal = a.name; bVal = b.name; break
          case 'date': aVal = new Date(a.lastModified); bVal = new Date(b.lastModified); break
          case 'size': aVal = parseFloat(a.size); bVal = parseFloat(b.size); break
          case 'author': aVal = a.author; bVal = b.author; break
          default: aVal = a.name; bVal = b.name
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
      
      return files
    }
    return []
  }

  // 獲取當前路徑
  const getCurrentPath = () => {
    const findPath = (nodes: (File | Folder)[], id: string, path: string[] = []): string[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.name]
        if (node.id === id) return currentPath
        if ('children' in node && node.children) {
          const found = findPath(node.children, id, currentPath)
          if (found) return found
        }
      }
      return null
    }

    const path = findPath(treeData, selectedFolderId)
    return path ? path : []
  }

  const currentFiles = getCurrentFolderFiles()

  return (
    <div className="min-h-screen bg-slate-900">
      <TopHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUploadClick={() => setShowUploadModal(true)}
        onNewFolderClick={() => setShowNewFolderModal(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAdvancedSearchClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        onNotificationsClick={() => setShowNotifications(!showNotifications)}
        onUserPanelClick={() => setShowUserPanel(!showUserPanel)}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* 左側樹狀目錄 */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-slate-900/50 backdrop-blur border-r border-slate-800/50 
                      flex flex-col transition-all duration-300`}>
          <div className="p-4 border-b border-slate-800/50 flex-1 overflow-y-auto">
            {!sidebarCollapsed && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-sm">文件目錄</h2>
                  <button
                    onClick={() => setShowActivityPanel(!showActivityPanel)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
                <FileTree
                  data={treeData}
                  expandedFolders={expandedFolders}
                  selectedFolderId={selectedFolderId}
                  onFolderExpand={(folderId: string) => {
                    setExpandedFolders(prev => 
                      prev.includes(folderId) 
                        ? prev.filter(id => id !== folderId)
                        : [...prev, folderId]
                    )
                  }}
                  onFolderSelect={(folderId: string) => {
                    setSelectedFolderId(folderId)
                    setSelectedFiles([])
                  }}
                  onContextMenu={(e, item) => {
                    e.preventDefault()
                    setShowContextMenu({ x: e.clientX, y: e.clientY, item })
                  }}
                />
              </>
            )}
          </div>
          
          {/* 快速操作按鈕 */}
          <div className="p-4 border-t border-slate-800/50">
            <div className={`${sidebarCollapsed ? 'flex flex-col space-y-2' : 'grid grid-cols-2 gap-2'}`}>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center justify-center space-x-2 p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 
                         shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                title="上傳文件"
              >
                <Upload className="w-4 h-4" />
                {!sidebarCollapsed && <span className="text-sm">上傳</span>}
              </button>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center justify-center space-x-2 p-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 
                         hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 
                         shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                title="新增資料夾"
              >
                <Plus className="w-4 h-4" />
                {!sidebarCollapsed && <span className="text-sm">新增</span>}
              </button>
            </div>
          </div>
        </div>

        {/* 右側內容區 */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              <StatsCards />
              
              <Breadcrumb path={getCurrentPath()} />

              {/* 進階搜尋 */}
              {showAdvancedSearch && (
                <div className="bg-slate-900/50 backdrop-blur rounded-xl p-5 mb-6 border border-slate-800/50">
                  <h3 className="text-white font-medium mb-4">進階搜尋</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">文件類型</label>
                      <select className="w-full bg-slate-800/50 text-white rounded-xl px-3 py-2.5 border border-slate-700/50 
                                     focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none 
                                     transition-all duration-200">
                        <option>所有類型</option>
                        <option>PDF</option>
                        <option>Word</option>
                        <option>Excel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">修改日期</label>
                      <select className="w-full bg-slate-800/50 text-white rounded-xl px-3 py-2.5 border border-slate-700/50 
                                     focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none 
                                     transition-all duration-200">
                        <option>任何時間</option>
                        <option>今天</option>
                        <option>本週</option>
                        <option>本月</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">作者</label>
                      <input
                        type="text"
                        placeholder="搜尋作者..."
                        className="w-full bg-slate-800/50 text-white rounded-xl px-3 py-2.5 border border-slate-700/50 
                                 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none 
                                 placeholder:text-slate-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 工具列 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-semibold">
                    文件列表 ({currentFiles.length})
                  </h3>
                  {selectedFiles.length > 0 && (
                    <div className="text-blue-400 text-sm">
                      已選擇 {selectedFiles.length} 個文件
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {selectedFiles.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
                                     hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm 
                                     transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                        <Download className="w-4 h-4" />
                        <span>批量下載</span>
                      </button>
                      <button className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 
                                     hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm 
                                     transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30">
                        <Trash2 className="w-4 h-4" />
                        <span>刪除</span>
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedFiles(selectedFiles.length === currentFiles.length ? [] : currentFiles.map(f => f.id))}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {selectedFiles.length === currentFiles.length ? '取消全選' : '全選'}
                  </button>
                  
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 文件列表 */}
              <FileList
                files={currentFiles}
                selectedFiles={selectedFiles}
                onFileSelect={(fileId) => {
                  setSelectedFiles(prev => 
                    prev.includes(fileId)
                      ? prev.filter(id => id !== fileId)
                      : [...prev, fileId]
                  )
                }}
                onContextMenu={(e, file) => {
                  e.preventDefault()
                  setShowContextMenu({ x: e.clientX, y: e.clientY, item: file })
                }}
                viewMode={viewMode}
              />
            </div>
          </div>

          {/* 右側活動面板 */}
          {showActivityPanel && <ActivityPanel />}
        </div>
      </div>

      {/* 右鍵選單 */}
      <ContextMenu
        show={showContextMenu}
        onClose={() => setShowContextMenu(null)}
      />
      
      {/* 點擊外部關閉選單 */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowContextMenu(null)}
        />
      )}
    </div>
  )
}
