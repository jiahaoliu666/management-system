import React from 'react';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  Users,
  File,
  Edit,
  Trash2,
  Star,
  Share2,
  Download,
  MessageSquare
} from 'lucide-react';
import { StatCardProps, Activity, Document } from '@/types';
import { LucideIcon } from 'lucide-react';

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  recentDocuments: Document[];
  recentActivities: Activity[];
  teamMemberCount?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ recentDocuments, recentActivities, teamMemberCount = 0 }) => {
  const stats = [
    {
      title: '總文件數',
      value: '1,234',
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
    },
    {
      title: '總目錄數',
      value: '5',
      icon: File,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
    },
    {
      title: '本週新增文件',
      value: '42',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
    },
    {
      title: '團隊成員數',
      value: teamMemberCount.toString(),
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/30'
    }
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 我的最愛 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
            <div className="w-6 flex-shrink-0 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white ml-2">我的最愛</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {/* 靜態範例資料 */}
            <div className="px-6 py-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
              <div className="w-6 flex-shrink-0 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-2">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">客戶進線流程</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">進線流程 • 王工程師 • 2024-03-18</p>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
              <div className="w-6 flex-shrink-0 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-2">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Akamai SOP</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">操作手冊 • 李設計師 • 2024-03-15</p>
              </div>
            </div>
          </div>
        </div>

        {/* 最近文件 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
            <div className="w-6 flex-shrink-0 flex items-center justify-center">
              <File className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white ml-2">最近文件</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="px-6 py-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <div className="w-6 flex-shrink-0 flex items-center justify-center">
                  <File className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="ml-2">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">{doc.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {doc.category} • {doc.author} • {doc.lastModified}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 