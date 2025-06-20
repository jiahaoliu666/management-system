import React from 'react';
import { 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Calendar,
  CheckSquare,
  FileText,
  MoreVertical,
  Phone,
  Video,
  Mail
} from 'lucide-react';
import { TeamMember, TeamActivity } from '@/types';
import { LucideIcon } from 'lucide-react';

interface TeamViewProps {
  members: TeamMember[];
  activities: TeamActivity[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'busy':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
};

const getActivityIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'meeting':
      return Calendar;
    case 'task':
      return CheckCircle2;
    default:
      return MessageSquare;
  }
};

const getActivityStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 dark:text-green-400';
    case 'in-progress':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'pending':
      return 'text-slate-600 dark:text-slate-400';
    default:
      return 'text-slate-600 dark:text-slate-400';
  }
};

const TeamView: React.FC<TeamViewProps> = ({ members, activities }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 團隊成員列表 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">團隊成員</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {members.map(member => (
              <div key={member.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-xl"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${getStatusColor(member.status)}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <Mail className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {member.tasks && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                      <span>任務進度</span>
                      <span>{member.tasks.completed}/{member.tasks.total}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                        style={{ width: `${(member.tasks.completed / member.tasks.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 團隊活動 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">團隊活動</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {activities.map(activity => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <ActivityIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activity.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </span>
                        {activity.status && (
                          <span className={`text-xs font-medium ${getActivityStatusColor(activity.status)} flex items-center`}>
                            {activity.status === 'completed' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : activity.status === 'in-progress' ? (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            ) : null}
                            {activity.status === 'completed' ? '已完成' :
                             activity.status === 'in-progress' ? '進行中' :
                             activity.status === 'pending' ? '待處理' : ''}
                          </span>
                        )}
                      </div>
                      {activity.participants && activity.participants.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {activity.participants.map((participant, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300"
                            >
                              {participant.charAt(0)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamView; 