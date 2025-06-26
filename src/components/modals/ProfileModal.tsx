import React, { useState, useEffect, useRef } from 'react';
import ModalBase from './ModalBase';
import { User, Mail, Shield, Camera, Key } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { showSuccess, showError } from '@/utils/notification';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(userName || (email ? email.split('@')[0] : ''));
      setName(userName || (email ? email.split('@')[0] : ''));
      setLocalProfile(profile || '');
      user.getUserAttributes((err, attributes) => {
        if (err || !attributes) {
          setAvatarUrl(null);
          return;
        }
        const pictureAttr = attributes.find(attr => attr.getName() === 'picture');
        if (pictureAttr) {
          setAvatarUrl(pictureAttr.getValue());
        } else {
          setAvatarUrl(null);
        }
      });
    }

    if (!isOpen && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [isOpen, userName, email, profile, user]);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showError('請選擇支援的圖片格式 (JPG, PNG, GIF, WEBP)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) {
      showError('找不到用戶資訊，請重新登入');
      return;
    }
    setLoading(true);

    let newAvatarUrl: string | null = null;

    try {
      if (selectedFile) {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timestamp = `${year}${month}${day}${hours}${minutes}`;
        
        const filename = `${email}_${timestamp}.${selectedFile.name.split('.').pop()}`;

        const res = await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: filename,
            filetype: selectedFile.type,
            oldAvatarUrl: avatarUrl,
          }),
        });
        if (!res.ok) throw new Error('取得上傳簽名失敗');
        const { uploadUrl, fileUrl } = await res.json();

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': selectedFile.type },
          body: selectedFile,
        });

        if (!uploadRes.ok) throw new Error('上傳圖片失敗');
        newAvatarUrl = fileUrl;
      }

      const attributesToUpdate = [
        new CognitoUserAttribute({ Name: 'name', Value: name }),
        new CognitoUserAttribute({ Name: 'profile', Value: localProfile }),
      ];

      if (newAvatarUrl) {
        attributesToUpdate.push(new CognitoUserAttribute({ Name: 'picture', Value: newAvatarUrl }));
      }
      
      await new Promise<void>((resolve, reject) => {
        user.updateAttributes(attributesToUpdate, (err, result) => {
          if (err) reject(err);
          else resolve();
        });
      });

      showSuccess('個人資料已成功更新');

      setProfile(localProfile);
      setUserName(name);
      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
      }
      fetchAndSetUserAttributes(user);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      onClose();

    } catch (err: any) {
      showError('更新個人資料失敗: ' + (err.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };
  
  const internalOnClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={internalOnClose} title="個人資料" size="4xl">
      <div className="flex flex-col md:flex-row gap-0 md:gap-10 w-full px-0 md:px-0 py-0 md:py-0 min-h-[400px]">
        <div className="md:w-1/3 w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-l-2xl flex flex-col items-center justify-center py-12 px-8 shadow-lg border-r border-slate-200 dark:border-slate-700">
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-900 overflow-hidden">
              {previewUrl || avatarUrl ? (
                <img src={(previewUrl || avatarUrl) as string} alt="頭像" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="h-20 w-20 text-white" />
              )}
            </div>
            <button
              className="absolute bottom-2 right-2 p-2 bg-white dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors ring-2 ring-indigo-200 dark:ring-slate-800 shadow disabled:opacity-60"
              aria-label="更換頭像"
              onClick={handleAvatarClick}
              disabled={loading}
            >
              <Camera className="h-5 w-5" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
            </button>
            {loading && selectedFile && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <span className="text-white text-xs">處理中...</span>
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{displayName}</h3>
          <p className="text-base text-slate-500 dark:text-slate-400 mb-2">{email || '...'}</p>
        </div>
        <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white dark:bg-slate-800 rounded-r-2xl shadow-lg">
          <form className="space-y-8 max-w-xl mx-auto w-full" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="space-y-2">
              <label htmlFor="profile-name" className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight mb-1">
                用戶名稱
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-700/50 transition-all duration-200 dark:text-slate-200 placeholder:text-slate-400 shadow-sm"
                placeholder="請輸入您的用戶名稱"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-email" className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight mb-1">
                電子郵件
              </label>
              <input
                id="profile-email"
                type="email"
                value={email || ''}
                disabled
                className="w-full px-4 py-3 text-base border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed placeholder:text-slate-400 shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-title" className="block text-base font-semibold text-slate-700 dark:text-slate-200 tracking-tight mb-1">
                職位名稱
              </label>
              <input
                id="profile-title"
                type="text"
                value={localProfile}
                onChange={e => setLocalProfile(e.target.value)}
                placeholder="請輸入您的職位"
                className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-700/50 transition-all duration-200 dark:text-slate-200 placeholder:text-slate-400 shadow-sm"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-3 space-y-reverse sm:space-y-0 pt-8 mt-10 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={internalOnClose}
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl transition-colors border border-slate-300 dark:border-slate-600"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading || !name}
                className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? '儲存中...' : '儲存變更'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalBase>
  );
};

export default ProfileModal; 