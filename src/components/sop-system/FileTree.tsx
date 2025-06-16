import { ChevronRight, ChevronDown, Folder, FolderOpen, Lock } from 'lucide-react'
import { TreeData, Folder as FolderType } from '@/types/sop'

interface FileTreeProps {
  data: TreeData[]
  expandedFolders: string[]
  selectedFolderId: string | null
  onFolderExpand: (folderId: string) => void
  onFolderSelect: (folderId: string) => void
  onContextMenu: (e: React.MouseEvent, item: TreeData) => void
}

export function FileTree({
  data,
  expandedFolders,
  selectedFolderId,
  onFolderExpand,
  onFolderSelect,
  onContextMenu
}: FileTreeProps) {
  const TreeNode = ({ node, level = 0 }: { node: TreeData; level?: number }) => {
    const isExpanded = expandedFolders.includes(node.id)
    const isSelected = selectedFolderId === node.id
    const hasChildren = node.children && node.children.length > 0
    const folderChildren = node.children?.filter((child): child is FolderType => 'children' in child) || []

    if (!('children' in node)) return null

    return (
      <div>
        <div
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
            isSelected ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => {
            if (hasChildren) {
              onFolderExpand(node.id)
            }
            onFolderSelect(node.id)
          }}
          onContextMenu={(e) => onContextMenu(e, node)}
        >
          {hasChildren && (
            <button className="flex items-center justify-center w-4 h-4">
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
          {!hasChildren && <div className="w-4 h-4" />}
          
          <div className="relative">
            {isExpanded && hasChildren ? (
              <FolderOpen className="w-4 h-4 text-blue-400" />
            ) : (
              <Folder className="w-4 h-4 text-blue-400" />
            )}
            {node.isProtected && (
              <Lock className="w-2 h-2 text-yellow-400 absolute -top-1 -right-1" />
            )}
          </div>
          
          <span className="text-sm font-medium flex-1">{node.name}</span>
          
          {node.children && (
            <span className="text-xs bg-slate-600 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {node.children.filter(child => !('children' in child)).length}
            </span>
          )}
        </div>

        {isExpanded && folderChildren.map(child => (
          <TreeNode key={child.id} node={child} level={level + 1} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  )
} 