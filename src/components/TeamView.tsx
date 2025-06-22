import React, { useState } from 'react';
import { User, CheckCircle2, XCircle } from 'lucide-react';
import { TeamMember } from '@/types';

interface TeamViewProps {
  members: any[]; // Cognito user list
  activities: any[]; // 不再使用
  loading?: boolean;
}

const PAGE_SIZE = 10;

const TeamView: React.FC<TeamViewProps> = ({ members, loading }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const totalPages = Math.ceil(members.length / PAGE_SIZE) || 1;

  // UI: 搜尋與排序（僅前端UI，無實際功能）
  const pagedMembers = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800">
                {pagedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm border-2 border-slate-200 dark:border-slate-700">暫無成員</td>
                  </tr>
                ) : (
                  pagedMembers.map((member, idx) => {
                    const name = member.Attributes?.find((a: any) => a.Name === 'name')?.Value || member.Username;
                    const email = member.Attributes?.find((a: any) => a.Name === 'email')?.Value;
                    const profile = member.Attributes?.find((a: any) => a.Name === 'profile')?.Value || '-';
                    const enabled = member.Enabled !== false;
                    const joined = member.UserCreateDate ? new Date(member.UserCreateDate).toLocaleDateString() : '-';
                    return (
                      <tr key={member.Username || member.id} className="border-2 border-slate-200 dark:border-slate-700">
                        <td className="px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400 align-middle border-r-2 border-slate-200 dark:border-slate-700">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap flex items-center justify-center space-x-3 align-middle min-w-[180px] border-r-2 border-slate-200 dark:border-slate-700">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-base font-medium text-slate-900 dark:text-white break-all">{name}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle max-w-xs border-r-2 border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-500 dark:text-slate-400 break-all">{email}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle max-w-xs border-r-2 border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-500 dark:text-slate-400 break-all">{profile}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle border-r-2 border-slate-200 dark:border-slate-700">
                          {enabled ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> 啟用
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                              <XCircle className="w-4 h-4 mr-1" /> 停用
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className="text-xs text-slate-400 dark:text-slate-500">{joined}</span>
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
    </div>
  );
};

export default TeamView; 