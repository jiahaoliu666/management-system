import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbProps {
  path: string[]
}

const Breadcrumb = ({ path }: BreadcrumbProps) => {
  return (
    <div className="flex items-center space-x-2 mb-6">
      <button className="text-slate-400 hover:text-white">
        <Home className="w-4 h-4" />
      </button>
      {path.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-slate-500" />
          <button
            className={`text-sm ${
              index === path.length - 1
                ? 'text-white font-medium'
                : 'text-slate-400 hover:text-white'
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