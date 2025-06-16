export interface File {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'md' | 'vsdx' | 'xlsx' | 'txt'
  size: string
  lastModified: string
  author: string
  category: string
  status: 'active' | 'archived' | 'draft'
  version: string
  tags: string[]
  downloads: number
  views: number
  isStarred: boolean
  isLocked: boolean
}

export interface Folder {
  id: string
  name: string
  type: 'folder'
  isProtected: boolean
  children?: (File | Folder)[]
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  time: string
  read: boolean
}

export interface Activity {
  id: string
  action: 'upload' | 'edit' | 'delete' | 'share'
  file: File
  user: string
  time: string
}

export type TreeData = Folder 