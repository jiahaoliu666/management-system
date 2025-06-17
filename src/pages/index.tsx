import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  Folder, 
  FolderOpen,
  Clock, 
  Star, 
  Settings, 
  User, 
  Bell, 
  Filter,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Download,
  Share2,
  Tag,
  Calendar,
  ChevronRight,
  ChevronDown,
  Home as HomeIcon,
  BookOpen,
  Users,
  Activity,
  Upload,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  LucideIcon,
  Moon,
  Sun,
  GitBranch,
  History,
  GitCommit,
  GitPullRequest,
  X,
  Image,
  Code,
  Table,
  ListOrdered,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  FileImage,
  FileCode,
  FileText as FileTextIcon,
  MessageSquare,
  Video,
  Phone,
  Mail,
  MoreVertical,
  UserPlus,
  ChevronLeft,
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  count?: number;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

interface Version {
  id: string;
  version: string;
  author: string;
  date: string;
  message: string;
  changes: string[];
}

interface Document {
  id: number;
  title: string;
  category: string;
  lastModified: string;
  author: string;
  status: 'published' | 'draft';
  priority: 'high' | 'medium' | 'low';
  versions?: Version[];
  currentVersion?: string;
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  trend?: string;
  color: string;
  bgColor: string;
}

interface ExpandedFolders {
  root: boolean;
  operation: boolean;
  development: boolean;
  aws: boolean;
  azure: boolean;
  frontend: boolean;
  backend: boolean;
  [key: string]: boolean;
}

interface ActivityIconProps {
  className?: string;
}

interface EditorTool {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  group?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  avatar?: string;
  lastActive?: string;
  tasks?: {
    total: number;
    completed: number;
  };
}

interface TeamActivity {
  id: string;
  type: 'message' | 'meeting' | 'task' | 'document';
  title: string;
  description: string;
  time: string;
  participants?: string[];
  status?: 'pending' | 'completed' | 'in-progress';
}

const ActivityIcon: React.FC<ActivityIconProps> = ({ className }) => (
  <Activity className={className} />
);

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<ExpandedFolders>({
    root: true,
    operation: false,
    development: true,
    aws: false,
    azure: false,
    frontend: false,
    backend: false
  });
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showMemberDetails, setShowMemberDetails] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 檢查系統主題偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    // 更新根元素的 class
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 文件目錄樹狀結構
  const fileDirectoryTree: FileNode[] = [
    {
      id: 'root',
      name: 'P400',
      type: 'folder',
      children: [
        {
          id: 'operation',
          name: '維運團隊',
          type: 'folder',
          children: [
            {
              id: 'aws',
              name: 'AWS',
              type: 'folder',
              children: []
            },
            {
              id: 'azure',
              name: 'Azure',
              type: 'folder',
              children: []
            }
          ]
        },
        {
          id: 'development',
          name: '開發部門',
          type: 'folder',
          count: 0,
          children: [
            {
              id: 'frontend',
              name: '前端',
              type: 'folder',
              children: []
            },
            {
              id: 'backend',
              name: '後端',
              type: 'folder',
              children: []
            }
          ]
        }
      ]
    }
  ];

  // 最近活動數據
  const recentActivities: Activity[] = [
    {
      id: 1,
      user: '張三',
      action: '上傳了文件',
      target: 'AWS架構設計.pdf',
      time: '10分鐘前',
      icon: Upload,
      iconColor: 'text-blue-600',
      iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      id: 2,
      user: '李四',
      action: '編輯了文件',
      target: '系統架構圖.vsdx',
      time: '30分鐘前',
      icon: Edit,
      iconColor: 'text-amber-600',
      iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100'
    },
    {
      id: 3,
      user: '王五',
      action: '刪除了文件',
      target: '舊版API文檔.docx',
      time: '2小時前',
      icon: Trash2,
      iconColor: 'text-red-600',
      iconBg: 'bg-gradient-to-br from-red-50 to-red-100'
    },
    {
      id: 4,
      user: '趙六',
      action: '查看了文件',
      target: 'Docker部署指南.md',
      time: '3小時前',
      icon: Eye,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100'
    }
  ];

  const categories = [
    { id: 'aws', name: 'AWS 雲端服務', count: 15, color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800' },
    { id: 'akamai', name: 'Akamai CDN', count: 8, color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' },
    { id: 'customer', name: '客戶服務流程', count: 12, color: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800' },
    { id: 'network', name: '網路設定', count: 6, color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800' },
    { id: 'security', name: '資安規範', count: 9, color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800' }
  ];

  const recentDocuments: Document[] = [
    {
      id: 1,
      title: 'Akamai CDN 配置指南',
      category: 'Akamai CDN',
      lastModified: '2024-06-15',
      author: '張工程師',
      status: 'published',
      priority: 'high'
    },
    {
      id: 2,
      title: 'AWS EC2 實例管理 SOP',
      category: 'AWS 雲端服務',
      lastModified: '2024-06-14',
      author: '李工程師',
      status: 'draft',
      priority: 'medium'
    },
    {
      id: 3,
      title: '客戶問題處理流程',
      category: '客戶服務流程',
      lastModified: '2024-06-13',
      author: '王工程師',
      status: 'published',
      priority: 'high'
    }
  ];

  const mockVersions: Version[] = [
    {
      id: 'v1.0.0',
      version: '1.0.0',
      author: '張工程師',
      date: '2024-03-15',
      message: '初始版本',
      changes: ['創建文件', '添加基本內容']
    },
    {
      id: 'v1.1.0',
      version: '1.1.0',
      author: '李工程師',
      date: '2024-03-16',
      message: '更新操作步驟',
      changes: ['更新步驟 1', '添加新的注意事項']
    },
    {
      id: 'v1.2.0',
      version: '1.2.0',
      author: '王工程師',
      date: '2024-03-17',
      message: '修復錯誤',
      changes: ['修正步驟 2 的錯誤', '更新相關連結']
    }
  ];

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
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

  const Sidebar = () => {
    const toggleFavorite = (folderId: string) => {
      setFavorites(prev => 
        prev.includes(folderId) 
          ? prev.filter(id => id !== folderId)
          : [...prev, folderId]
      );
    };

    return (
      <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 h-full shadow-sm transition-all duration-300`}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center">
                <img src="/logo.png" alt="技術文件系統" className="h-8 w-auto" />
              </div>
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
                團隊協作
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
              <button className="p-1 hover:bg-slate-100 rounded-md transition-colors duration-200">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              {renderDirectoryTree(fileDirectoryTree)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const Header = () => {
    return (
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋文件、SOP、流程..."
                className="pl-12 pr-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-96 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 text-sm dark:text-slate-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button className="flex items-center px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              <Filter className="mr-2 h-4 w-4" />
              篩選
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">通知</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                            <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 dark:text-slate-100">
                              <span className="font-medium">{activity.user}</span>{' '}
                              {activity.action}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {activity.target}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                    <button className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                      查看全部通知
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">張工程師</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">system@example.com</p>
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">張工程師</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">system@example.com</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors duration-200">
                      <User className="h-4 w-4 inline-block mr-2" />
                      個人資料
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors duration-200">
                      <Settings className="h-4 w-4 inline-block mr-2" />
                      設定
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors duration-200">
                      <Bell className="h-4 w-4 inline-block mr-2" />
                      通知設定
                    </button>
                  </div>
                  <div className="py-1 border-t border-slate-100 dark:border-slate-700">
                    <button className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 text-left transition-colors duration-200">
                      登出
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, trend, color, bgColor }) => (
    <div className={`${bgColor} p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 ${color} rounded-xl shadow-sm`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">儀表板</h2>
          <p className="text-slate-600">歡迎回來，張工程師 - 今天是 {new Date().toLocaleDateString('zh-TW')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
            最後更新：{new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="總文件數"
          value="156"
          trend="+12%"
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={Activity}
          title="本週更新"
          value="12"
          trend="+8%"
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={Clock}
          title="待審核"
          value="8"
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={Users}
          title="活躍用戶"
          value="10"
          trend="+2"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          bgColor="bg-white"
        />
      </div>

      {/* 最近文件和最近活動 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">最近文件</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">查看全部</button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all duration-200 group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200">
                        {doc.title}
                      </h4>
                      <p className="text-sm text-slate-500">{doc.category} • {doc.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {doc.priority === 'high' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`px-3 py-1 text-xs rounded-lg font-medium ${
                        doc.status === 'published' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {doc.status === 'published' ? '已發布' : '草稿'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">{doc.lastModified}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近活動卡片 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">最近活動</h3>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200">
                  <div className={`p-2.5 rounded-xl shadow-sm ${activity.iconBg}`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 mb-1">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      <span className="text-slate-600">{activity.action}</span>
                    </p>
                    <p className="text-sm font-medium text-slate-900 truncate mb-2">
                      {activity.target}
                    </p>
                    <div className="flex items-center text-xs text-slate-500 space-x-4">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {activity.user}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DocumentsView = () => {
    const [showPreview, setShowPreview] = useState(false);
    const [showVersionCompare, setShowVersionCompare] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

    return (
      <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">文件管理</h2>
            <p className="text-slate-600 dark:text-slate-400">管理和組織您的技術文件</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>新增文件</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentDocuments.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-xl">
                    <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowVersionHistory(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-all duration-200"
                      title="版本歷史"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowVersionCompare(true);
                      }}
                      className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/50 rounded-lg transition-all duration-200"
                      title="版本比較"
                    >
                      <GitBranch className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedDocument(doc);
                        setShowPreview(true);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-lg transition-all duration-200"
                      title="預覽"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-all duration-200">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  {doc.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{doc.category}</p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span>{doc.author}</span>
                  <span>{doc.lastModified}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {doc.priority === 'high' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`px-3 py-1 text-xs rounded-lg font-medium ${
                      doc.status === 'published' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                    }`}>
                      {doc.status === 'published' ? '已發布' : '草稿'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-all duration-200">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showVersionHistory && <VersionHistoryModal />}
        
        {showPreview && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">文件預覽</h3>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
                <div className="prose dark:prose-invert max-w-none">
                  <h1>{selectedDocument.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mb-8">
                    <span>{selectedDocument.category}</span>
                    <span>•</span>
                    <span>{selectedDocument.author}</span>
                    <span>•</span>
                    <span>最後更新：{selectedDocument.lastModified}</span>
                  </div>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">文件內容預覽區域</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showVersionCompare && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">版本比較</h3>
                  <button 
                    onClick={() => setShowVersionCompare(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <select 
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    value={selectedVersions[0] || ''}
                    onChange={(e) => setSelectedVersions([e.target.value, selectedVersions[1]])}
                  >
                    <option value="">選擇版本 1</option>
                    {mockVersions.map((version) => (
                      <option key={version.id} value={version.id}>
                        v{version.version} - {version.date}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400">vs</span>
                  <select 
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    value={selectedVersions[1] || ''}
                    onChange={(e) => setSelectedVersions([selectedVersions[0], e.target.value])}
                  >
                    <option value="">選擇版本 2</option>
                    {mockVersions.map((version) => (
                      <option key={version.id} value={version.id}>
                        v{version.version} - {version.date}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">版本 1</h4>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400">選擇版本以查看內容</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">版本 2</h4>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400">選擇版本以查看內容</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const VersionHistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">版本歷史</h3>
            <button 
              onClick={() => setShowVersionHistory(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
          <div className="space-y-6">
            {mockVersions.map((version) => (
              <div key={version.id} className="relative pl-8 pb-6 border-l-2 border-slate-200 dark:border-slate-700 last:border-l-0">
                <div className="absolute left-0 top-0 w-4 h-4 bg-indigo-500 rounded-full -translate-x-1/2"></div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <GitCommit className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium text-slate-900 dark:text-slate-100">v{version.version}</span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{version.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{version.message}</p>
                  <div className="space-y-2">
                    {version.changes.map((change, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <span className="text-emerald-500">•</span>
                        <span className="text-slate-600 dark:text-slate-300">{change}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <User className="h-3 w-3 mr-1" />
                    {version.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const editorTools: EditorTool[] = [
    { icon: Bold, label: '粗體', shortcut: 'Ctrl+B', group: 'text' },
    { icon: Italic, label: '斜體', shortcut: 'Ctrl+I', group: 'text' },
    { icon: Underline, label: '底線', shortcut: 'Ctrl+U', group: 'text' },
    { icon: Strikethrough, label: '刪除線', shortcut: 'Ctrl+S', group: 'text' },
    { icon: AlignLeft, label: '靠左對齊', group: 'align' },
    { icon: AlignCenter, label: '置中對齊', group: 'align' },
    { icon: AlignRight, label: '靠右對齊', group: 'align' },
    { icon: ListOrdered, label: '有序列表', group: 'list' },
    { icon: ListChecks, label: '待辦列表', group: 'list' },
    { icon: Link, label: '插入連結', shortcut: 'Ctrl+K', group: 'insert' },
    { icon: Image, label: '插入圖片', group: 'insert' },
    { icon: Table, label: '插入表格', group: 'insert' },
    { icon: Code, label: '插入代碼', group: 'insert' },
  ];

  const groupedTools = editorTools.reduce((acc, tool) => {
    const group = tool.group || 'other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(tool);
    return acc;
  }, {} as Record<string, EditorTool[]>);

  const EditorView = () => (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">文件編輯器</h2>
          <p className="text-slate-600 dark:text-slate-400">創建和編輯您的技術文件</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsPreview(!isPreview)}
            className={`px-5 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-medium flex items-center space-x-2 ${
              isPreview ? 'bg-slate-100 dark:bg-slate-800' : ''
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{isPreview ? '編輯模式' : '預覽模式'}</span>
          </button>
          <button className="px-5 py-2.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-medium">
            儲存草稿
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
            發布文件
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-700 p-6">
          <input
            type="text"
            placeholder="文件標題..."
            className="w-full text-2xl font-bold border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent"
            defaultValue=""
          />
          <div className="flex items-center space-x-6 mt-6">
            <select className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              <option>選擇分類</option>
              <option>AWS 雲端服務</option>
              <option>Akamai CDN</option>
              <option>客戶服務流程</option>
            </select>
            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="新增標籤..."
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 h-[calc(100vh-20rem)]">
          <div className="border-r border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {Object.entries(groupedTools).map(([group, tools]) => (
                    <div key={group} className="flex items-center space-x-2">
                      {tools.map((tool) => (
                        <button
                          key={tool.label}
                          onClick={() => setActiveTool(tool.label)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            activeTool === tool.label
                              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                        >
                          <tool.icon className="h-4 w-4" />
                        </button>
                      ))}
                      {group !== Object.keys(groupedTools)[Object.keys(groupedTools).length - 1] && (
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              <textarea
                placeholder="開始編寫文件內容..."
                className="w-full h-full resize-none border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent"
                defaultValue=""
              />
            </div>
          </div>
          
          <div>
            <div className="border-b border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">預覽</h3>
            </div>
            <div className="p-6 prose dark:prose-invert max-w-none h-full overflow-y-auto">
              <h1>文件標題</h1>
              <p>在這裡顯示文件的預覽內容...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: '張工程師',
      role: '維運工程師',
      status: 'online',
      lastActive: '剛剛',
      tasks: { total: 5, completed: 3 }
    },
    {
      id: '2',
      name: '李工程師',
      role: '維運工程師',
      status: 'away',
      lastActive: '10分鐘前',
      tasks: { total: 3, completed: 1 }
    },
    {
      id: '3',
      name: '王工程師',
      role: '維運工程師',
      status: 'busy',
      lastActive: '30分鐘前',
      tasks: { total: 4, completed: 2 }
    },
    {
      id: '4',
      name: '陳工程師',
      role: '維運工程師',
      status: 'offline',
      lastActive: '2小時前',
      tasks: { total: 2, completed: 2 }
    },
    {
      id: '5',
      name: '林工程師',
      role: '維運工程師',
      status: 'online',
      lastActive: '剛剛',
      tasks: { total: 6, completed: 4 }
    }
  ];

  const teamActivities: TeamActivity[] = [
    {
      id: '1',
      type: 'meeting',
      title: '週會討論',
      description: '討論本週工作進度和下週計劃',
      time: '今天 14:00',
      participants: ['張工程師', '李工程師', '王工程師'],
      status: 'pending'
    },
    {
      id: '2',
      type: 'task',
      title: 'AWS 架構優化',
      description: '優化現有 AWS 架構以提高效能',
      time: '明天 10:00',
      participants: ['張工程師', '陳工程師'],
      status: 'in-progress'
    },
    {
      id: '3',
      type: 'document',
      title: '系統維護 SOP',
      description: '更新系統維護標準作業程序',
      time: '後天 15:00',
      participants: ['王工程師', '林工程師'],
      status: 'completed'
    }
  ];

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400';
      case 'away':
        return 'bg-amber-400';
      case 'busy':
        return 'bg-red-400';
      case 'offline':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusText = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return '在線';
      case 'away':
        return '暫時離開';
      case 'busy':
        return '忙碌中';
      case 'offline':
        return '離線';
      default:
        return '未知';
    }
  };

  const getActivityIcon = (type: TeamActivity['type']) => {
    switch (type) {
      case 'meeting':
        return <Video className="h-4 w-4" />;
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActivityStatusColor = (status: TeamActivity['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300';
    }
  };

  const TeamView = () => (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">團隊協作</h2>
          <p className="text-slate-600 dark:text-slate-400">管理團隊成員和協作活動</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>邀請成員</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">團隊成員</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                    onClick={() => setShowMemberDetails(member.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${getStatusColor(member.status)}`}></span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{member.tasks?.completed}/{member.tasks?.total}</span>
                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(member.tasks?.completed || 0) / (member.tasks?.total || 1) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}></span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{getStatusText(member.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'documents':
        return <DocumentsView />;
      case 'editor':
        return <EditorView />;
      case 'team':
        return <TeamView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

