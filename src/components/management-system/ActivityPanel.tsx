import { Activity, Clock, User, FileText } from 'lucide-react'
import type { Activity as ActivityType } from '@/types/management'

const mockActivities: ActivityType[] = [
  {
    id: '1',
    action: 'upload',
    file: {
      id: '1',
      name: 'AWS架構設計.pdf',
      type: 'pdf',
      size: '2.5MB',
      lastModified: '2024-03-20',
      author: '張三',
      category: '技術文檔',
      status: 'active',
      version: '1.0',
      tags: ['AWS', '架構'],
      downloads: 120,
      views: 350,
      isStarred: true,
      isLocked: false
    },
    user: '張三',
    time: '10分鐘前'
  },
  {
    id: '2',
    action: 'edit',
    file: {
      id: '2',
      name: '系統架構圖.vsdx',
      type: 'vsdx',
      size: '1.8MB',
      lastModified: '2024-03-19',
      author: '李四',
      category: '設計文檔',
      status: 'active',
      version: '2.1',
      tags: ['架構圖', 'Visio'],
      downloads: 85,
      views: 210,
      isStarred: false,
      isLocked: false
    },
    user: '李四',
    time: '30分鐘前'
  },
  {
    id: '3',
    action: 'delete',
    file: {
      id: '3',
      name: '舊版API文檔.docx',
      type: 'docx',
      size: '3.2MB',
      lastModified: '2024-03-18',
      author: '王五',
      category: 'API文檔',
      status: 'archived',
      version: '1.0',
      tags: ['API', '文檔'],
      downloads: 45,
      views: 120,
      isStarred: false,
      isLocked: true
    },
    user: '王五',
    time: '2小時前'
  }
]

const ActivityPanel = () => {
  const getActionIcon = (action: ActivityType['action']) => {
    switch (action) {
      case 'upload':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'edit':
        return <FileText className="w-4 h-4 text-yellow-500" />
      case 'delete':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'share':
        return <FileText className="w-4 h-4 text-green-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionText = (action: ActivityType['action']) => {
    switch (action) {
      case 'upload':
        return '上傳了文件'
      case 'edit':
        return '編輯了文件'
      case 'delete':
        return '刪除了文件'
      case 'share':
        return '分享了文件'
      default:
        return '執行了操作'
    }
  }

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-sm">最近活動</h2>
        <button className="p-1 text-slate-400 hover:text-white">
          <Clock className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getActionIcon(activity.action)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">
                  {activity.user}
                </span>
                <span className="text-slate-400 text-sm">
                  {getActionText(activity.action)}
                </span>
              </div>
              <div className="text-slate-400 text-sm truncate">
                {activity.file.name}
              </div>
              <div className="text-slate-500 text-xs">
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityPanel 