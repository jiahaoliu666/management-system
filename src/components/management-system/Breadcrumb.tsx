import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbProps {
  path: string[]
}

const Breadcrumb = ({ path }: BreadcrumbProps) => {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200">
        <Home className="w-4 h-4" />
      </button>
      {path.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-slate-500" />
          <button
            className={`text-sm px-2 py-1 rounded-lg transition-all duration-200 ${
              index === path.length - 1
                ? 'text-white font-medium bg-slate-800/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {item}
          </button>
        </div>
      ))}
    </div>
  )
}

export default Breadcrumb 