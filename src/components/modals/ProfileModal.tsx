import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase';
import { User, Mail, Shield, Camera, Key } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { showSuccess, showError } from '@/utils/notification';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { email, user, userName, setUserName, profile, setProfile, fetchAndSetUserAttributes } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [name, setName] = useState('');
    const [localProfile, setLocalProfile] = useState(''); // local only
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (isOpen) {
        setDisplayName(userName || (email ? email.split('@')[0] : ''));
        setName(userName || (email ? email.split('@')[0] : ''));
        setLocalProfile(profile || '');
      }
    }, [isOpen, userName, email, profile]);

    // 儲存姓名與職位名稱到 Cognito
    const handleSave = async () => {
      if (!user) {
        showError('找不到用戶資訊，請重新登入');
        return;
      }
      setLoading(true);
      user.updateAttributes([
        { Name: 'name', Value: name },
        { Name: 'profile', Value: localProfile }
      ], (err, result) => {
        setLoading(false);
        if (err) {
          showError('更新個人資料失敗: ' + (err.message || '未知錯誤'));
          return;
        }
        showSuccess('個人資料已成功更新');
        setProfile(localProfile); // 只在儲存時才同步 context
        fetchAndSetUserAttributes(user);
        onClose();
      });
    };
    
    return (
        <ModalBase isOpen={isOpen} onClose={onClose} title="個人資料" size="md">
            <div className="space-y-6">
                {/* Avatar and basic info */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <User className="h-14 w-14 text-white" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ring-2 ring-white dark:ring-slate-800">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h3>
                    <p className="text-slate-500 dark:text-slate-400">{email || '...'}</p>
                </div>

                {/* Personal Information Form */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">用戶名稱</label>
                        <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 text-sm dark:text-slate-200"/>
                    </div>
                    <div>
                        <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">電子郵件</label>
                         <input id="profile-email" type="email" value={email || ''} disabled className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"/>
                    </div>
                    <div>
                        <label htmlFor="profile-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">職位名稱</label>
                        <input id="profile-title" type="text" value={localProfile} onChange={e => setLocalProfile(e.target.value)} placeholder="請輸入您的職位" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 text-sm dark:text-slate-200"/>
                    </div>
                </div>

                {/* Password Change */}
                <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3 pt-2 border-t border-slate-200 dark:border-slate-700">更改密碼</h4>
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">目前密碼</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 text-sm dark:text-slate-200"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">新密碼</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 text-sm dark:text-slate-200"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">確認新密碼</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 text-sm dark:text-slate-200"/>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                     <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600">取消</button>
                     <button onClick={handleSave} disabled={loading || !name} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-60">
                       {loading ? '儲存中...' : '儲存變更'}
                     </button>
                </div>

            </div>
        </ModalBase>
    );
};

export default ProfileModal; 