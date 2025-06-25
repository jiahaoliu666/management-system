import React, { useState, useMemo } from 'react';
import { User, CheckCircle2, XCircle } from 'lucide-react';
import { TeamMember, CognitoUser } from '@/types';
import { showSuccess, showError } from '@/utils/notification';
import { formatJoinDate } from '@/utils/constants';

interface TeamViewProps {
  members: CognitoUser[]; // 使用新的類型定義
  activities: any[]; // 不再使用
  loading?: boolean;
  refetch: () => void;
  onInviteClick: () => void;
  onDeleteClick: (user: CognitoUser) => void;
}

const PAGE_SIZE = 10;

const TeamView: React.FC<TeamViewProps> = ({ members, loading, refetch, onInviteClick, onDeleteClick }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent-desc');
  const [profileFilter, setProfileFilter] = useState('');
  
  // 獲取所有職位名稱選項
  const profileOptions = useMemo(() => {
    const profiles = new Set<string>();
    members.forEach(member => {
      const profile = member.Attributes?.find((a: any) => a.Name === 'profile')?.Value;
      if (profile && profile !== '尚未填寫') {
        profiles.add(profile);
      }
    });
    return Array.from(profiles).sort();
  }, [members]);

  // 即時搜尋和過濾邏輯
  const filteredMembers = useMemo(() => {
    let filtered = members;
    
    // 搜尋過濾
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filtered = filtered.filter(member => {
        const nameAttr = member.Attributes?.find((a: any) => a.Name === 'name')?.Value || '';
        const emailAttr = member.Attributes?.find((a: any) => a.Name === 'email')?.Value || '';
        
        // 處理姓名顯示邏輯
        let displayName = nameAttr;
        if (!displayName && emailAttr) {
          displayName = emailAttr.split('@')[0];
        }
        
        // 不區分大小寫的模糊搜尋
        return displayName.toLowerCase().includes(searchTerm) || 
               emailAttr.toLowerCase().includes(searchTerm);
      });
    }
    
    // 職位名稱過濾
    if (profileFilter) {
      filtered = filtered.filter(member => {
        const profile = member.Attributes?.find((a: any) => a.Name === 'profile')?.Value || '尚未填寫';
        return profile === profileFilter;
      });
    }
    
    return filtered;
  }, [members, search, profileFilter]);

  // 排序邏輯
  const sortedMembers = useMemo(() => {
    const sorted = [...filteredMembers];
    
    switch (sort) {
      case 'recent-desc':
        // 最近加入由近至遠（預設）
        return sorted.sort((a, b) => {
          const dateA = a.Attributes?.find((attr: any) => attr.Name === 'birthdate')?.Value || a.UserCreateDate || '';
          const dateB = b.Attributes?.find((attr: any) => attr.Name === 'birthdate')?.Value || b.UserCreateDate || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      case 'recent-asc':
        // 最近加入由遠至近
        return sorted.sort((a, b) => {
          const dateA = a.Attributes?.find((attr: any) => attr.Name === 'birthdate')?.Value || a.UserCreateDate || '';
          const dateB = b.Attributes?.find((attr: any) => attr.Name === 'birthdate')?.Value || b.UserCreateDate || '';
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
      case 'status':
        return sorted.sort((a, b) => {
          const statusA = a.UserStatus || '';
          const statusB = b.UserStatus || '';
          return statusA.localeCompare(statusB);
        });
      default:
        return sorted;
    }
  }, [filteredMembers, sort]);

  // 分頁邏輯
  const totalPages = Math.ceil(sortedMembers.length / PAGE_SIZE) || 1;
  const pagedMembers = sortedMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 當搜尋、排序或篩選改變時，重置到第一頁
  React.useEffect(() => {
    setPage(1);
  }, [search, sort, profileFilter]);

  // 高亮搜尋結果的函數
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
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
              <div className="relative w-full md:w-64">
                <input
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition pr-10"
                  placeholder="搜尋用戶名稱/信箱..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search.trim() && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <select
                className="w-full md:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                value={profileFilter}
                onChange={e => setProfileFilter(e.target.value)}
              >
                <option value="">所有職位</option>
                {profileOptions.map(profile => (
                  <option key={profile} value={profile}>{profile}</option>
                ))}
              </select>
              <select
                className="w-full md:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="recent-desc">加入日期由近至遠</option>
                <option value="recent-asc">加入日期由遠至近</option>
                <option value="status">依照狀態進行排序</option>
              </select>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                onClick={onInviteClick}
                type="button"
              >
                邀請成員
              </button>
            </div>
          </div>
          
          {/* 統計區塊：預設顯示總成員數，搜尋時顯示搜尋結果統計 */}
          <div className="px-8 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            {search.trim() || profileFilter ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {search.trim() && `搜尋「${search}」`}
                {search.trim() && profileFilter && ' 且 '}
                {profileFilter && `職位「${profileFilter}」`}
                {` 找到 ${filteredMembers.length} 個結果（共 ${members.length} 個成員）`}
              </p>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                共 {members.length} 個成員
              </p>
            )}
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
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm border-2 border-slate-200 dark:border-slate-700">
                      {search.trim() || profileFilter ? '沒有找到符合條件的成員' : '暫無成員'}
                    </td>
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
                      onDeleteClick(member);
                    };
                    return (
                      <tr key={member.Username} className="border-2 border-slate-200 dark:border-slate-700">
                        <td className="px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-400 align-middle border-r-2 border-slate-200 dark:border-slate-700">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap flex items-center justify-center space-x-3 align-middle min-w-[180px] border-r-2 border-slate-200 dark:border-slate-700">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-base font-medium text-slate-900 dark:text-white break-all">{highlightSearchTerm(name, search)}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle max-w-xs border-r-2 border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-500 dark:text-slate-400 break-all">{highlightSearchTerm(emailAttr || '', search)}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle max-w-xs border-r-2 border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-500 dark:text-slate-400 break-all">{highlightSearchTerm(profile, search)}</span>
                        </td>
                        <td className="px-6 py-4 text-center align-middle border-r-2 border-slate-200 dark:border-slate-700">
                          {statusTag}
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className="text-xs text-slate-400 dark:text-slate-500">{highlightSearchTerm(joined, search)}</span>
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
              {(search.trim() || profileFilter) && `（共 ${filteredMembers.length} 個結果）`}
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