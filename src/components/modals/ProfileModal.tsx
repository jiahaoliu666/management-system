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
  const { email, user, userName, setUserName, profile, setProfile, fetchAndSetUserAttributes, changePassword } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [localProfile, setLocalProfile] = useState(''); // local only
  const [loading, setLoading] = useState(false);
  // 密碼變更相關 state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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

  // 密碼變更提交
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    // 前端驗證
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('請完整填寫所有欄位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('新密碼與確認新密碼不一致');
      return;
    }
    // Cognito 密碼規則（可依實際需求調整）
    if (newPassword.length < 8) {
      setPasswordError('新密碼長度至少需 8 字元');
      return;
    }
    setPasswordLoading(true);
    const result = await changePassword(oldPassword, newPassword);
    setPasswordLoading(false);
    if (result.success) {
      setPasswordSuccess(true);
      showSuccess('密碼已成功變更');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 2000);
    } else {
      setPasswordError(result.error || '密碼變更失敗');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="個人資料" size="xl">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 w-full px-4 md:px-10 py-6 md:py-10">
        {/* 左側：頭像與基本資料 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pr-0 md:pr-8">
          {/* Avatar and basic info */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-16 w-16 text-white" />
              </div>
              <button 
                className="absolute bottom-0 right-0 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ring-2 ring-white dark:ring-slate-800"
                aria-label="更換頭像"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{displayName}</h3>
            <p className="text-base text-slate-500 dark:text-slate-400">{email || '...'}</p>
          </div>

          {/* Personal Information Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="profile-name" className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                用戶名稱
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 dark:text-slate-200 placeholder:text-slate-400"
                placeholder="請輸入您的用戶名稱"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-email" className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                電子郵件
              </label>
              <input
                id="profile-email"
                type="email"
                value={email || ''}
                disabled
                className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-title" className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                職位名稱
              </label>
              <input
                id="profile-title"
                type="text"
                value={localProfile}
                onChange={e => setLocalProfile(e.target.value)}
                placeholder="請輸入您的職位"
                className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* 右側：密碼變更區塊 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-10 md:pt-0 md:pl-10">
          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">更改密碼</h4>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                目前密碼
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 dark:text-slate-200 placeholder:text-slate-400"
                autoComplete="current-password"
                disabled={passwordLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                新密碼
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 dark:text-slate-200 placeholder:text-slate-400"
                autoComplete="new-password"
                disabled={passwordLoading}
              />
              <div className="text-xs text-slate-400 mt-1">密碼需至少 8 字元，建議包含大小寫字母與數字</div>
            </div>
            <div className="space-y-2">
              <label className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                確認新密碼
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700/50 transition-all duration-200 dark:text-slate-200 placeholder:text-slate-400"
                autoComplete="new-password"
                disabled={passwordLoading}
              />
            </div>
            {passwordError && (
              <div className="text-xs text-red-500 mt-1">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-xs text-green-600 mt-1">密碼變更成功！</div>
            )}
            <button
              type="button"
              onClick={handleChangePassword}
              className="w-full px-4 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={passwordLoading}
            >
              {passwordLoading ? '變更中...' : '儲存新密碼'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-3 space-y-reverse sm:space-y-0 pt-8 mt-10 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl transition-colors border border-slate-300 dark:border-slate-600"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={loading || !name}
          className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '儲存中...' : '儲存變更'}
        </button>
      </div>
    </ModalBase>
  );
};

export default ProfileModal; 