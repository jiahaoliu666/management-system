import React, { useState } from 'react';
import { User, CheckCircle2, XCircle } from 'lucide-react';
import { TeamMember, CognitoUser } from '@/types';
import { showSuccess, showError } from '@/utils/notification';
import { formatJoinDate } from '@/utils/constants';

interface TeamViewProps {
  members: CognitoUser[]; // 使用新的類型定義
  activities: any[]; // 不再使用
  loading?: boolean;
}

const PAGE_SIZE = 10;

const TeamView: React.FC<TeamViewProps> = ({ members, loading }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const totalPages = Math.ceil(members.length / PAGE_SIZE) || 1;

  // 邀請成員 modal 狀態
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // 刪除成員 modal 狀態
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{name: string, email: string, username: string} | null>(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // UI: 搜尋與排序（僅前端UI，無實際功能）
  const pagedMembers = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 刪除成員功能（modal 專用）
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: deleteTarget.username }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('成員已刪除');
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        window.location.reload(); // 或呼叫刷新 users 的函數
      } else {
        showError(data.error || '刪除失敗');
      }
    } catch (err) {
      showError('刪除失敗，請稍後再試');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">載入中...</div>;
  }
  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-700 gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">團隊成員</h2>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <input
                className="w-full md:w-64 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="搜尋用戶名稱/信箱... (UI)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled
              />
              <select
                className="w-full md:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                value={sort}
                onChange={e => setSort(e.target.value)}
                disabled
              >
                <option value="recent">最近加入</option>
                <option value="name">名稱排序</option>
                <option value="email">信箱排序</option>
                <option value="status">狀態排序</option>
              </select>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                onClick={() => setInviteOpen(true)}
                type="button"
              >
                邀請成員
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-2 border-slate-200 dark:border-slate-700">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r-2 border-slate-200 dark:border-slate-700">編號</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r-2 border-slate-200 dark:border-slate-700">用戶名稱</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r-2 border-slate-200 dark:border-slate-700">電子郵件</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r-2 border-slate-200 dark:border-slate-700">職位名稱</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r-2 border-slate-200 dark:border-slate-700">狀態</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">加入日期</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800">
                {pagedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm border-2 border-slate-200 dark:border-slate-700">暫無成員</td>
                  </tr>
                ) : (
                  pagedMembers.map((member, idx) => {
                    const nameAttr = member.Attributes?.find((a: any) => a.Name === 'name')?.Value;
                    const emailAttr = member.Attributes?.find((a: any) => a.Name === 'email')?.Value;
                    let name = nameAttr || '';
                    if (!name) {
                      if (emailAttr && typeof emailAttr === 'string') {
                        name = emailAttr.split('@')[0];
                      } else {
                        name = '';
                      }
                    }
                    let profile = member.Attributes?.find((a: any) => a.Name === 'profile')?.Value;
                    if (!profile) profile = '尚未填寫';
                    const enabled = member.Enabled !== false;
                    const userStatus = member.UserStatus;
                    // 狀態顯示元件
                    let statusTag = null;
                    if (!enabled || userStatus === 'DISABLED') {
                      statusTag = (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                          <XCircle className="w-4 h-4 mr-1" /> 已停用
                        </span>
                      );
                    } else {
                      switch (userStatus) {
                        case 'FORCE_CHANGE_PASSWORD':
                          statusTag = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              待變更密碼
                            </span>
                          );
                          break;
                        case 'CONFIRMED':
                          statusTag = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> 啟用
                            </span>
                          );
                          break;
                        case 'UNCONFIRMED':
                          statusTag = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v2m0 4h.01" /></svg>
                              未驗證
                            </span>
                          );
                          break;
                        case 'ARCHIVED':
                          statusTag = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h4a1 1 0 001-1v-2h3a1 1 0 001-1V7" /></svg>
                              已封存
                            </span>
                          );
                          break;
                        case 'COMPROMISED':
                          statusTag = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414M6.343 17.657l-1.414 1.414M12 8v4l3 3" /></svg>
                              已洩漏
                            </span>
                          );
                          break;
                        case 'RESET_REQUIRED':
                          statusTag = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                              需重設
                            </span>
                          );
                          break;
                        case 'UNKNOWN':
                          statusTag = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                              未知
                            </span>
                          );
                          break;
                        default:
                          statusTag = (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                              {userStatus || '未知狀態'}
                            </span>
                          );
                      }
                    }
                    // 優先使用 birthdate 作為加入日期，如果沒有則使用 UserCreateDate
                    const birthdateAttr = member.Attributes?.find((a: any) => a.Name === 'birthdate')?.Value;
                    const joined = formatJoinDate(birthdateAttr || member.UserCreateDate);
                    
                    // 刪除成員功能
                    const openDeleteModal = () => {
                      setDeleteTarget({ name, email: emailAttr || '', username: member.Username });
                      setDeleteInput('');
                      setDeleteModalOpen(true);
                    };
                    return (
                      <tr key={member.Username} className="border-2 border-slate-200 dark:border-slate-700">
                        <td className="px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400 align-middle border-r-2 border-slate-200 dark:border-slate-700">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap flex items-center justify-center space-x-3 align-middle min-w-[180px] border-r-2 border-slate-200 dark:border-slate-700">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-base font-medium text-slate-900 dark:text-white break-all">{name}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle max-w-xs border-r-2 border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-500 dark:text-slate-400 break-all">{emailAttr}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle max-w-xs border-r-2 border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-500 dark:text-slate-400 break-all">{profile}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle border-r-2 border-slate-200 dark:border-slate-700">
                          {statusTag}
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className="text-xs text-slate-400 dark:text-slate-500">{joined}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <button
                            className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
                            onClick={openDeleteModal}
                          >
                            刪除
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* 分頁按鈕（美化，置中，間距更佳） */}
          <div className="flex justify-center items-center px-8 py-6 space-x-3">
            <button
              className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              上一頁
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 select-none">
              第 {page} / {totalPages} 頁
            </span>
            <button
              className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              下一頁
            </button>
          </div>
        </div>
      </div>
      {/* 邀請成員 Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              onClick={() => setInviteOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">邀請新成員</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setInviteLoading(true);
                try {
                  const res = await fetch('/api/invite-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: inviteEmail,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    showSuccess('邀請已發送！');
                    setInviteOpen(false);
                    setInviteEmail('');
                  } else {
                    showError(data.error || '邀請失敗');
                  }
                } catch (err) {
                  showError('邀請失敗，請稍後再試');
                } finally {
                  setInviteLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">電子郵件</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                  disabled={inviteLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 mt-2"
                disabled={inviteLoading || !inviteEmail}
              >
                {inviteLoading ? '邀請中...' : '發送邀請'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* 刪除成員確認 Modal */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">確認刪除成員</h3>
            <p className="mb-4 text-slate-700 dark:text-slate-200 text-sm">您即將刪除成員：<span className="font-bold text-red-600">{deleteTarget.name}</span>（{deleteTarget.email}）<br/>此操作無法復原。請輸入成員名稱 <span className="font-bold">{deleteTarget.name}</span> 以確認。</p>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
              placeholder="請輸入成員名稱以確認刪除"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              disabled={deleteLoading}
            />
            <button
              className="w-full py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
              onClick={handleDelete}
              disabled={deleteLoading || deleteInput !== deleteTarget.name}
            >
              {deleteLoading ? '刪除中...' : '確認刪除'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView; 