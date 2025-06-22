import React, { useState } from 'react';
import ModalBase from './ModalBase';
import { AtSign, MessageSquare, FileText, Users } from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToggleSwitch = ({ enabled, setEnabled }: { enabled: boolean, setEnabled: (enabled: boolean) => void }) => {
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
        enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  
  const [notifications, setNotifications] = useState({
    mentions: { email: true, push: true },
    comments: { email: true, push: false },
    documentUpdates: { email: false, push: true },
    teamActivities: { email: true, push: true },
  });

  const handleToggle = (category: keyof typeof notifications, type: 'email' | 'push') => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type],
      }
    }));
  };

  const notificationTypes = [
    { id: 'mentions', title: '提及', description: '當有人在評論或文件中 @提及您時', icon: AtSign, category: 'mentions' as const },
    { id: 'comments', title: '評論', description: '當您建立或參與的文件有新評論時', icon: MessageSquare, category: 'comments' as const },
    { id: 'documentUpdates', title: '文件更新', description: '當您關注的文件有重要更新時', icon: FileText, category: 'documentUpdates' as const },
    { id: 'teamActivities', title: '團隊動態', description: '關於您團隊的重要公告或活動', icon: Users, category: 'teamActivities' as const },
  ];

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="通知設定" size="lg">
      <div className="space-y-6">
        <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">通知類型</div>
          <div className="flex space-x-8">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-12 text-center">Email</span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-12 text-center">站內</span>
          </div>
        </div>
        <div className="space-y-2">
          {notificationTypes.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="flex items-center">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg mr-4">
                  <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-300"/>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">{item.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
              </div>
              <div className="flex space-x-8">
                <div className="w-12 flex justify-center">
                  <ToggleSwitch enabled={notifications[item.category].email} setEnabled={() => handleToggle(item.category, 'email')} />
                </div>
                <div className="w-12 flex justify-center">
                  <ToggleSwitch enabled={notifications[item.category].push} setEnabled={() => handleToggle(item.category, 'push')} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
           <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600">取消</button>
           <button className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">儲存設定</button>
        </div>
      </div>
    </ModalBase>
  );
};

export default NotificationSettingsModal; 