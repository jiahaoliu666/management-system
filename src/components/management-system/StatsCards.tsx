import { FileText, Users, Download, Eye } from 'lucide-react'

const stats = [
  {
    name: '總文件數',
    value: '1,234',
    icon: FileText,
    change: '+12%',
    changeType: 'increase',
    color: 'blue'
  },
  {
    name: '活躍用戶',
    value: '89',
    icon: Users,
    change: '+5%',
    changeType: 'increase',
    color: 'emerald'
  },
  {
    name: '下載次數',
    value: '3,456',
    icon: Download,
    change: '+23%',
    changeType: 'increase',
    color: 'violet'
  },
  {
    name: '瀏覽次數',
    value: '12,345',
    icon: Eye,
    change: '-2%',
    changeType: 'decrease',
    color: 'amber'
  }
]

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-slate-900/50 backdrop-blur rounded-xl p-5 border border-slate-800/50 
                   hover:border-slate-700/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.name}</p>
              <p className="text-white text-2xl font-semibold mt-1.5">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium ${
                stat.changeType === 'increase'
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {stat.change}
            </span>
            <span className="text-slate-500 text-sm ml-2">較上月</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards 