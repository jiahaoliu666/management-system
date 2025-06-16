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
      className="fixed z-50 bg-slate-900/95 backdrop-blur border border-slate-800/50 rounded-xl shadow-lg 
                 shadow-slate-900/50 py-1.5 min-w-[200px]"
      style={{
        top: show.y,
        left: show.x,
      }}
    >
      {isFile ? (
        <>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4 text-blue-400" />
            <span>下載</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Edit className="w-4 h-4 text-yellow-400" />
            <span>編輯</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>分享</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Copy className="w-4 h-4 text-violet-400" />
            <span>複製</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Star className="w-4 h-4 text-amber-400" />
            <span>標記星號</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>鎖定</span>
          </button>
          <div className="border-t border-slate-800/50 my-1.5" />
          <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>刪除</span>
          </button>
        </>
      ) : (
        <>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Edit className="w-4 h-4 text-yellow-400" />
            <span>重命名</span>
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>保護資料夾</span>
          </button>
          <div className="border-t border-slate-800/50 my-1.5" />
          <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-800/50 
                           flex items-center space-x-2 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>刪除</span>
          </button>
        </>
      )}
    </div>
  )
}

export default ContextMenu 