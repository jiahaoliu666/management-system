import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'bg-red-100 text-red-600'
    case 'docx':
      return 'bg-blue-100 text-blue-600'
    case 'xlsx':
      return 'bg-green-100 text-green-600'
    case 'pptx':
      return 'bg-orange-100 text-orange-600'
    case 'txt':
      return 'bg-gray-100 text-gray-600'
    case 'md':
      return 'bg-purple-100 text-purple-600'
    case 'vsdx':
      return 'bg-yellow-100 text-yellow-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
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
      return status
  }
} 