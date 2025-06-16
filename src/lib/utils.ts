import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileIcon(type: string) {
  switch (type) {
    case 'pdf':
      return 'bg-red-500/10 text-red-500'
    case 'docx':
      return 'bg-blue-500/10 text-blue-500'
    case 'xlsx':
      return 'bg-green-500/10 text-green-500'
    case 'md':
      return 'bg-purple-500/10 text-purple-500'
    case 'vsdx':
      return 'bg-orange-500/10 text-orange-500'
    default:
      return 'bg-slate-500/10 text-slate-500'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'archived':
      return 'bg-slate-500'
    case 'draft':
      return 'bg-yellow-500'
    default:
      return 'bg-slate-500'
  }
}

export function getStatusText(status: string) {
  switch (status) {
    case 'active':
      return '使用中'
    case 'archived':
      return '已歸檔'
    case 'draft':
      return '草稿'
    default:
      return '未知'
  }
} 