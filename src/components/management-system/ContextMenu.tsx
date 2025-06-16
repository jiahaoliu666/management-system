import { Download, Edit, Trash2, Star, Lock, Share2, Copy, MoreVertical } from 'lucide-react'
import type { File, Folder } from '@/types/management'

interface ContextMenuProps {
  show: { x: number; y: number; item: File | Folder } | null
  onClose: () => void
}

const ContextMenu = ({ show, onClose }: ContextMenuProps) => {
  if (!show) return null

  const isFile = 'type' in show.item

  return (
    <div
      className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 min-w-[200px]"
      style={{
        top: show.y,
        left: show.x,
      }}
    >
      {isFile ? (
        <>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>下載</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>編輯</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>分享</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2">
            <Copy className="w-4 h-4" />
            <span>複製</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>標記星號</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>鎖定</span>
          </button>
          <div className="border-t border-slate-700 my-1" />
          <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center space-x-2">
            <Trash2 className="w-4 h-4" />
            <span>刪除</span>
          </button>
        </>
      ) : (
        <>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>重命名</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>保護資料夾</span>
          </button>
          <div className="border-t border-slate-700 my-1" />
          <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center space-x-2">
            <Trash2 className="w-4 h-4" />
            <span>刪除</span>
          </button>
        </>
      )}
    </div>
  )
}

export default ContextMenu 