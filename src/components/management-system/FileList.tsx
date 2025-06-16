import { FileText, Star, Lock, Download, Eye, MoreVertical } from 'lucide-react'
import type { File } from '@/types/management'
import { getFileIcon } from '@/lib/utils'

interface FileListProps {
  files: File[]
  selectedFiles: string[]
  onFileSelect: (fileId: string) => void
  onContextMenu: (e: React.MouseEvent, file: File) => void
  viewMode: 'grid' | 'list'
}

export function FileList({
  files,
  selectedFiles,
  onFileSelect,
  onContextMenu,
  viewMode
}: FileListProps) {
  const FileListItem = ({ file }: { file: File }) => {
    const isSelected = selectedFiles.includes(file.id)

    return (
      <div
        className={`group relative rounded-xl border transition-all duration-200 ${
          isSelected
            ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10'
            : 'border-slate-800/50 hover:border-slate-700/50 hover:bg-slate-800/50'
        }`}
        onClick={() => onFileSelect(file.id)}
        onContextMenu={(e) => onContextMenu(e, file)}
      >
        <div className="p-4">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${getFileIcon(file.type)} shadow-lg`}>
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-white truncate">
                    {file.name}
                  </h3>
                  {file.isStarred && (
                    <Star className="w-4 h-4 text-yellow-400" />
                  )}
                  {file.isLocked && (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg 
                                 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
                <span className="px-2 py-1 bg-slate-800/50 rounded-lg">{file.category}</span>
                <span className="px-2 py-1 bg-slate-800/50 rounded-lg">v{file.version}</span>
                <span>{file.size}</span>
                <span>{file.author}</span>
                <span>{file.lastModified}</span>
              </div>
              <div className="mt-3 flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{file.views}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <Download className="w-3.5 h-3.5" />
                  <span>{file.downloads}</span>
                </div>
                <div className="flex-1" />
                <div className="flex items-center space-x-2">
                  {file.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-800/50 text-slate-300 rounded-lg text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <FileListItem key={file.id} file={file} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileListItem key={file.id} file={file} />
      ))}
    </div>
  )
} 