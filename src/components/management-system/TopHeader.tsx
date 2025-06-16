import { Search, Upload, Plus, Grid, List, Bell, Filter, FileText, User, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

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
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-[2000px] mx-auto">
        <div className="flex items-center space-x-6 flex-1">
          <div className="flex items-center space-x-4">
            <button
              onClick={onSidebarToggle}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Grid className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                SOP 企業管理系統
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">Professional Document Management</p>
            </div>
          </div>
          
          <div className="relative flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="搜尋文件、作者、標籤..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-muted/50 text-foreground pl-10 pr-4 py-2.5 rounded-xl border border-border 
                         focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none 
                         placeholder:text-muted-foreground transition-all duration-200"
              />
              <button
                onClick={onAdvancedSearchClick}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground 
                         hover:bg-muted/50 p-1 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onUploadClick}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                     text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 
                     shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <Upload className="w-4 h-4" />
            <span>上傳文件</span>
          </button>

          <button
            onClick={onNewFolderClick}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 
                     text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 
                     shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>新增資料夾</span>
          </button>

          <div className="flex items-center bg-muted/50 rounded-xl p-1.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                viewMode === 'grid' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                viewMode === 'list' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <ThemeToggle />

          <button
            onClick={onNotificationsClick}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl relative 
                     transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center 
                           justify-center shadow-lg shadow-red-500/20">
              <span className="text-[10px] text-white font-medium">4</span>
            </span>
          </button>

          <button
            onClick={onUserPanelClick}
            className="flex items-center space-x-3 bg-muted/50 rounded-xl p-2 hover:bg-muted/70 
                     transition-all duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center 
                          justify-center shadow-lg shadow-blue-500/20">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-foreground text-sm font-medium">維運工程師</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
} 