import { FileText, Star, Lock, Download, Eye } from 'lucide-react'
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
        className={`group relative rounded-lg border ${
          isSelected
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700 hover:border-slate-600'
        }`}
        onClick={() => onFileSelect(file.id)}
        onContextMenu={(e) => onContextMenu(e, file)}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getFileIcon(file.type)}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
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
              <div className="mt-1 flex items-center space-x-4 text-xs text-slate-400">
                <span>{file.category}</span>
                <span>v{file.version}</span>
                <span>{file.size}</span>
                <span>{file.author}</span>
                <span>{file.lastModified}</span>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{file.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-3 h-3" />
                  <span>{file.downloads}</span>
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
    <div className="space-y-2">
      {files.map((file) => (
        <FileListItem key={file.id} file={file} />
      ))}
    </div>
  )
} 