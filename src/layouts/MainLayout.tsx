import React, { useState } from 'react';
import { FileText, MessageSquare, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Activity } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const recentActivities: Activity[] = [
    {
      id: '1',
      user: '張工程師',
      action: '更新了文件',
      target: '系統架構設計文件',
      time: '10 分鐘前',
      icon: FileText,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      type: 'document',
      priority: 'high',
      status: 'completed'
    },
    {
      id: '2',
      user: '李設計師',
      action: '評論了文件',
      target: '使用者介面設計規範',
      time: '30 分鐘前',
      icon: MessageSquare,
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      type: 'message',
      priority: 'medium',
      status: 'in-progress'
    },
    {
      id: '3',
      user: '王經理',
      action: '審核了文件',
      target: '專案進度報告',
      time: '1 小時前',
      icon: CheckCircle2,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      type: 'task',
      priority: 'high',
      status: 'completed'
    }
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expandedFolders={expandedFolders}
        setExpandedFolders={setExpandedFolders}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <div className="flex-1 flex flex-col">
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          recentActivities={recentActivities}
        />
        <main className="flex-1 min-h-0 h-full flex flex-col px-4 md:px-8 py-4 md:py-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

 