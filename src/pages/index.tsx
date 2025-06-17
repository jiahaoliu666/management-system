import React, { useState } from 'react';
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
  LucideIcon
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

interface Document {
  id: number;
  title: string;
  category: string;
  lastModified: string;
  author: string;
  status: 'published' | 'draft';
  priority: 'high' | 'medium' | 'low';
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

const ActivityIcon: React.FC<ActivityIconProps> = ({ className }) => (
  <Activity className={className} />
);

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<ExpandedFolders>({
    root: true,
    operation: false,
    development: true,
    aws: false,
    azure: false,
    frontend: false,
    backend: false
  });

  // 文件目錄樹狀結構
  const fileDirectoryTree: FileNode[] = [
    {
      id: 'root',
      name: '根目錄',
      type: 'folder',
      children: [
        {
          id: 'operation',
          name: '營運部門',
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

  const Sidebar = () => (
    <div className="w-72 bg-white border-r border-slate-200 h-full shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          技術文件系統
        </h1>
        <p className="text-sm text-slate-500 mt-1">專業文件管理平台</p>
      </div>
      
      <nav className="px-4 py-6 space-y-2">
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
      </nav>

      {/* 文件目錄樹狀結構 */}
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
    </div>
  );

  const Header = () => (
    <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜尋文件、SOP、流程..."
              className="pl-12 pr-6 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-96 bg-slate-50 focus:bg-white transition-all duration-200 text-sm"
            />
          </div>
          <button className="flex items-center px-4 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 text-slate-600 hover:text-slate-900">
            <Filter className="mr-2 h-4 w-4" />
            篩選
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl font-medium">
            <Plus className="mr-2 h-4 w-4" />
            新增文件
          </button>
          <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
            <Settings className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-700">張工程師</span>
              <p className="text-xs text-slate-500">系統管理員</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

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

  const DocumentsView = () => (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">文件管理</h2>
          <p className="text-slate-600">管理和組織您的技術文件</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-indigo-100 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-indigo-100 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentDocuments.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 group overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all duration-200">
                    <Star className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all duration-200">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                {doc.title}
              </h3>
              <p className="text-sm text-slate-600 mb-4">{doc.category}</p>
              
              <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
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
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {doc.status === 'published' ? '已發布' : '草稿'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EditorView = () => (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">文件編輯器</h2>
          <p className="text-slate-600">創建和編輯您的技術文件</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-5 py-2.5 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium">
            儲存草稿
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
            發布文件
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <input
            type="text"
            placeholder="輸入文件標題..."
            className="w-full text-2xl font-bold border-none outline-none text-slate-900 placeholder-slate-400"
            defaultValue="新的 SOP 文件"
          />
          <div className="flex items-center space-x-6 mt-6">
            <select className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
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
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 富文本編輯器工具列 */}
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {[
              { label: '粗體', shortcut: 'Ctrl+B' },
              { label: '斜體', shortcut: 'Ctrl+I' },
              { label: '底線', shortcut: 'Ctrl+U' },
            ].map((btn) => (
              <button
                key={btn.label}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium"
                title={btn.shortcut}
              >
                {btn.label}
              </button>
            ))}
            <div className="w-px h-6 bg-slate-300 mx-2"></div>
            {['標題 1', '標題 2', '標題 3'].map((btn) => (
              <button
                key={btn}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium"
              >
                {btn}
              </button>
            ))}
            <div className="w-px h-6 bg-slate-300 mx-2"></div>
            {['項目清單', '數字清單', '連結', '表格'].map((btn) => (
              <button
                key={btn}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* 編輯區域 */}
        <div className="p-8">
          <div className="min-h-96 text-slate-700 leading-relaxed prose max-w-none">
            <h1 className="text-3xl font-bold mb-6 text-slate-900">文件內容編輯區</h1>
            <p className="mb-6 text-slate-600">在這裡開始編寫您的 SOP 文件內容...</p>
            
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">操作步驟</h2>
            <ol className="list-decimal list-inside space-y-3 mb-6 text-slate-700">
              <li>第一步操作說明</li>
              <li>第二步操作說明</li>
              <li>第三步操作說明</li>
            </ol>
            
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">相關連結</h2>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li><a href="#" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200">AWS 官方文件</a></li>
              <li><a href="#" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200">內部流程規範</a></li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">注意事項</h2>
            <p className="text-slate-600">重要的操作注意事項和安全提醒...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TeamView = () => (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">團隊協作</h2>
          <p className="text-slate-600">管理團隊成員和協作活動</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">團隊成員</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {['張工程師', '李工程師', '王工程師', '陳工程師', '林工程師'].map((name, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{name}</p>
                      <p className="text-sm text-slate-500">維運工程師</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <span className="text-xs text-emerald-600 font-medium">在線</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">最近活動</h3>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-200">
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
    <div className="h-screen bg-slate-100 flex">
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
