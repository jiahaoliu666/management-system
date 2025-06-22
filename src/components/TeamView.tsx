import React from 'react';
import { User } from 'lucide-react';
import { TeamMember } from '@/types';

interface TeamViewProps {
  members: any[]; // Cognito user list
  activities: any[]; // 不再使用
  loading?: boolean;
}

const TeamView: React.FC<TeamViewProps> = ({ members, loading }) => {
  if (loading) {
    return <div className="p-8 text-center text-slate-500">載入中...</div>;
  }
  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-1 gap-8">
        {/* 團隊成員列表 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">團隊成員</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {members.map(member => (
              <div key={member.Username || member.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                      {/* 顯示 Cognito name 或 username */}
                      {member.Attributes?.find((a: any) => a.Name === 'name')?.Value || member.Username}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {member.Attributes?.find((a: any) => a.Name === 'email')?.Value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamView; 