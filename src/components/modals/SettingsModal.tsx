import React, { useState } from 'react';
import ModalBase from './ModalBase';
import { User, Palette, Shield, Bell, LogIn } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: '公開資料', icon: User },
    { id: 'appearance', label: '外觀', icon: Palette },
    { id: 'security', label: '安全性', icon: Shield },
    { id: 'sessions', label: '登入活動', icon: LogIn },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">公開資料設定</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">此資訊將會顯示在您與團隊成員協作的頁面中。</p>
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">使用者名稱</label>
                  <input type="text" defaultValue="haoder" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50"/>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">個人簡介</label>
                  <textarea rows={3} placeholder="介紹一下您自己..." className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50"></textarea>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
           <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">外觀設定</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">自訂系統的顯示外觀。</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">主題</label>
                <div className="flex space-x-4">
                  <button className="flex-1 p-4 border border-slate-300 dark:border-slate-600 rounded-lg text-center">淺色</button>
                  <button className="flex-1 p-4 border border-indigo-500 rounded-lg text-center bg-indigo-50 dark:bg-slate-700 ring-2 ring-indigo-500">深色</button>
                  <button className="flex-1 p-4 border border-slate-300 dark:border-slate-600 rounded-lg text-center">跟隨系統</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">安全性設定</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">管理您的帳號安全性設定。</p>
             <div className="space-y-4 divide-y divide-slate-200 dark:divide-slate-700">
                <div className="pt-4 first:pt-0">
                    <h4 className="text-md font-medium text-slate-900 dark:text-white">兩步驟驗證</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">啟用兩步驟驗證以保護您的帳號安全。</p>
                    <button className="mt-3 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">啟用</button>
                </div>
                <div className="pt-4">
                    <h4 className="text-md font-medium text-slate-900 dark:text-white">備用碼</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">如果您無法接收驗證碼，可以使用備用碼登入。</p>
                    <button className="mt-3 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg border border-slate-300 dark:border-slate-600">顯示備用碼</button>
                </div>
             </div>
          </div>
        );
      case 'sessions':
        return (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">登入活動</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">這是您目前已登入的裝置列表，您可以隨時撤銷任何您不認得的工作階段。</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">macOS, Chrome</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">台灣，台北市 • 目前的工作階段</p>
                </div>
                <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400">目前</button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Windows, Edge</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">日本，東京 • 2 天前</p>
                </div>
                <button className="text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400">撤銷</button>
              </div>
            </div>
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <button className="w-full text-center py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">登出所有其他裝置</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="設定" size="3xl">
      <div className="flex space-x-8">
        <div className="w-1/4">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="w-3/4 pl-8 border-l border-slate-200 dark:border-slate-700">
          {renderContent()}
        </div>
      </div>
    </ModalBase>
  );
};

export default SettingsModal; 