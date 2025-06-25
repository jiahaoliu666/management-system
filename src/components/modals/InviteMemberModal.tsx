import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase';
import { showSuccess, showError } from '@/utils/notification';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, refetch }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('邀請已發送！');
        setInviteEmail('');
        refetch();
        onClose();
      } else {
        showError(data.error || '邀請失敗');
      }
    } catch (err) {
      showError('邀請失敗，請稍後再試');
    } finally {
      setInviteLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setInviteEmail('');
      setInviteLoading(false);
    }
  }, [isOpen]);

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="邀請新成員" size="md">
      <form onSubmit={handleInvite} className="space-y-6">
        <div>
          <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            電子郵件
          </label>
          <input
            id="invite-email"
            type="email"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            disabled={inviteLoading}
            placeholder="請輸入新成員的電子郵件"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
           <button type="button" onClick={onClose} disabled={inviteLoading} className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600 disabled:opacity-50">
             取消
           </button>
           <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50"
              disabled={inviteLoading || !inviteEmail}
            >
              {inviteLoading ? '邀請中...' : '發送邀請'}
            </button>
        </div>
      </form>
    </ModalBase>
  );
};

export default InviteMemberModal; 