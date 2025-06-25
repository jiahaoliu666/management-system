import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  Settings, 
  X,
  Globe,
  Lock,
  Users as UsersIcon
} from 'lucide-react';
import { Activity } from '@/types';
import { useAuth } from '@/auth/AuthContext';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showNotifications: boolean;
  setShowNotifications: (value: boolean) => void;
  showUserMenu: boolean;
  setShowUserMenu: (value: boolean) => void;
  recentActivities: Activity[];
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onNotificationSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  showNotifications,
  setShowNotifications,
  showUserMenu,
  setShowUserMenu,
  recentActivities,
  onProfileClick,
  onSettingsClick,
  onNotificationSettingsClick,
}) => {
  const { email, userName, logout, profile } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const displayEmail = profile || email || '...';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowUserMenu, setShowNotifications]);

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
          <div className="relative" ref={notificationsRef}>
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
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{userName || '用戶'}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{displayEmail}</p>
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{userName || '用戶'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{displayEmail}</p>
                </div>
                <div className="py-1">
                  <button onClick={onProfileClick} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors duration-200">
                    <User className="h-4 w-4 inline-block mr-2" />
                    個人資料
                  </button>
                  <button onClick={onSettingsClick} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors duration-200">
                    <Settings className="h-4 w-4 inline-block mr-2" />
                    設定
                  </button>
                  <button onClick={onNotificationSettingsClick} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors duration-200">
                    <Bell className="h-4 w-4 inline-block mr-2" />
                    通知設定
                  </button>
                </div>
                <div className="py-1 border-t border-slate-100 dark:border-slate-700">
                  <button onClick={logout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 text-left transition-colors duration-200">
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

export default Header; 