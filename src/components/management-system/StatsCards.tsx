import { FileText, Users, Download, Eye } from 'lucide-react'

const stats = [
  {
    name: '總文件數',
    value: '1,234',
    icon: FileText,
    change: '+12%',
    changeType: 'increase'
  },
  {
    name: '活躍用戶',
    value: '89',
    icon: Users,
    change: '+5%',
    changeType: 'increase'
  },
  {
    name: '下載次數',
    value: '3,456',
    icon: Download,
    change: '+23%',
    changeType: 'increase'
  },
  {
    name: '瀏覽次數',
    value: '12,345',
    icon: Eye,
    change: '-2%',
    changeType: 'decrease'
  }
]

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-slate-800 rounded-lg p-4 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{stat.name}</p>
              <p className="text-white text-2xl font-semibold mt-1">
                {stat.value}
              </p>
            </div>
            <div className="p-2 bg-slate-700 rounded-lg">
              <stat.icon className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-sm ${
                stat.changeType === 'increase'
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              {stat.change}
            </span>
            <span className="text-slate-400 text-sm ml-2">較上月</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards 