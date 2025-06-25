import React, { useState, useEffect, useMemo } from 'react';
import ModalBase from './ModalBase';
import { showSuccess, showError } from '@/utils/notification';
import { CognitoUser } from '@/types';

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  user: CognitoUser | null;
}

const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({ isOpen, onClose, refetch, user }) => {
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const targetInfo = useMemo(() => {
    if (!user) return null;

    const emailAttr = user.Attributes?.find(a => a.Name === 'email')?.Value;
    const nameAttr = user.Attributes?.find(a => a.Name === 'name')?.Value;

    return {
      name: nameAttr || emailAttr?.split('@')[0] || '此用戶',
      email: emailAttr || '',
      username: user.Username,
    };
  }, [user]);

  const handleDelete = async () => {
    if (!targetInfo) return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetInfo.username }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('成員已成功刪除');
        refetch();
        onClose();
      } else {
        showError(data.error || '刪除成員失敗');
      }
    } catch (err) {
      showError('刪除成員時發生錯誤，請稍後再試');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setDeleteInput('');
      setDeleteLoading(false);
    }
  }, [isOpen]);

  if (!targetInfo) return null;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="確認刪除成員" size="md">
      <div className="space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          您即將永久刪除成員：<span className="font-bold text-red-500">{targetInfo.name}</span> ({targetInfo.email}).
          <br />
          此操作無法復原。請在下方輸入成員名稱 <span className="font-bold text-slate-800 dark:text-slate-100">{targetInfo.name}</span> 以確認刪除。
        </p>
        
        <div>
          <label htmlFor="delete-confirm" className="sr-only">
            請輸入成員名稱以確認刪除
          </label>
          <input
            id="delete-confirm"
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            placeholder={`輸入 "${targetInfo.name}"`}
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
            disabled={deleteLoading}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onClose} disabled={deleteLoading} className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600 disabled:opacity-50">
            取消
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading || deleteInput !== targetInfo.name}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50"
          >
            {deleteLoading ? '正在刪除...' : '確認刪除'}
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

export default DeleteMemberModal; 