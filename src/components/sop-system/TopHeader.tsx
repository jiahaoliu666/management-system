import { Search, Upload, Plus, Grid, List, Bell, Filter, FileText, User, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onUploadClick: () => void
  onNewFolderClick: () => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onAdvancedSearchClick: () => void
  onNotificationsClick: () => void
  onUserPanelClick: () => void
  sidebarCollapsed: boolean
  onSidebarToggle: () => void
}

export function TopHeader({
  searchQuery,
  onSearchChange,
  onUploadClick,
  onNewFolderClick,
  viewMode,
  onViewModeChange,
  onAdvancedSearchClick,
  onNotificationsClick,
  onUserPanelClick,
  sidebarCollapsed,
  onSidebarToggle,
}: TopHeaderProps) {
  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={onSidebarToggle}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
            >
              <Grid className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SOP 企業管理系統</h1>
              <p className="text-slate-400 text-xs">Professional Document Management</p>
            </div>
          </div>
          
          <div className="relative flex-1 max-w-md ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜尋文件、作者、標籤..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={onAdvancedSearchClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onUploadClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>上傳文件</span>
          </button>

          <button
            onClick={onNewFolderClick}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新增資料夾</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onNotificationsClick}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">4</span>
            </span>
          </button>

          <button
            onClick={onUserPanelClick}
            className="flex items-center space-x-2 bg-slate-800 rounded-lg p-2 hover:bg-slate-700 transition-colors"
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="text-white text-sm">維運工程師</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  )
} 