import { 
  Globe, 
  Lock, 
  Users, 
  AtSign, 
  MessageSquare, 
  RefreshCw, 
  AlertCircle,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  File,
  Video,
  CheckCircle,
  MessageSquare as MessageSquareIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  ListChecks,
  Link,
  Table,
  Code,
  Image,
  MoreHorizontal
} from 'lucide-react';

export const fileTags = [
  { id: 'urgent', name: '緊急', color: 'bg-red-100 text-red-700' },
  { id: 'review', name: '待審核', color: 'bg-amber-100 text-amber-700' },
  { id: 'draft', name: '草稿', color: 'bg-slate-100 text-slate-700' },
  { id: 'important', name: '重要', color: 'bg-blue-100 text-blue-700' },
  { id: 'archived', name: '已歸檔', color: 'bg-slate-100 text-slate-500' }
];

export const filePermissions = [
  { id: 'public', name: '公開', icon: Globe },
  { id: 'private', name: '私有', icon: Lock },
  { id: 'team', name: '團隊', icon: Users }
];

export const searchFilters = [
  { id: 'title', name: '標題' },
  { id: 'content', name: '內容' },
  { id: 'author', name: '作者' },
  { id: 'date', name: '日期' },
  { id: 'category', name: '分類' },
  { id: 'tag', name: '標籤' }
];

export const categories = [
  {
    id: 'cloud',
    name: '雲端服務',
    subcategories: ['AWS', 'Azure', 'GCP']
  },
  {
    id: 'cdn',
    name: 'CDN',
    subcategories: ['Akamai', 'Cloudflare']
  },
  {
    id: 'customer-service',
    name: '客服',
    subcategories: ['常見問題', '標準作業程序']
  },
  {
    id: 'network',
    name: '網路設定',
    subcategories: ['DNS', '防火牆']
  },
  {
    id: 'security',
    name: '安全性',
    subcategories: ['SSL 憑證', '備份策略']
  }
];

export const notificationTypes = [
  { type: 'mention', name: '提及', icon: AtSign, color: 'text-blue-500' },
  { type: 'comment', name: '評論', icon: MessageSquare, color: 'text-green-500' },
  { type: 'update', name: '更新', icon: RefreshCw, color: 'text-amber-500' },
  { type: 'alert', name: '提醒', icon: AlertCircle, color: 'text-red-500' }
];

export const fileTypes = [
  { id: 'doc', name: '文件', icon: FileText, color: 'text-blue-500' },
  { id: 'code', name: '程式碼', icon: FileCode, color: 'text-green-500' },
  { id: 'image', name: '圖片', icon: FileImage, color: 'text-purple-500' },
  { id: 'video', name: '影片', icon: FileVideo, color: 'text-red-500' },
  { id: 'audio', name: '音訊', icon: FileAudio, color: 'text-yellow-500' },
  { id: 'archive', name: '壓縮檔', icon: FileArchive, color: 'text-orange-500' },
  { id: 'other', name: '其他', icon: File, color: 'text-gray-500' }
];

export const editorTools = [
  { icon: Bold, label: '粗體', shortcut: 'Ctrl+B', group: 'text' },
  { icon: Italic, label: '斜體', shortcut: 'Ctrl+I', group: 'text' },
  { icon: Underline, label: '底線', shortcut: 'Ctrl+U', group: 'text' },
  { icon: Strikethrough, label: '刪除線', shortcut: 'Ctrl+S', group: 'text' },
  { icon: AlignLeft, label: '靠左對齊', group: 'align' },
  { icon: AlignCenter, label: '置中對齊', group: 'align' },
  { icon: AlignRight, label: '靠右對齊', group: 'align' },
  { icon: ListOrdered, label: '有序列表', group: 'list' },
  { icon: ListChecks, label: '待辦列表', group: 'list' },
  { icon: Link, label: '插入連結', shortcut: 'Ctrl+K', group: 'insert' },
  { icon: Image, label: '插入圖片', group: 'insert' },
  { icon: Table, label: '插入表格', group: 'insert' },
  { icon: Code, label: '插入代碼', group: 'insert' },
];

export const permissionOptions = [
  { id: 'view', name: '可以查看' },
  { id: 'comment', name: '可以評論' },
  { id: 'edit', name: '可以編輯' },
  { id: 'full', name: '完整權限' }
];

export const NOTIFICATION = {
  DURATION: {
    DEFAULT: 4000,
    SUCCESS: 3000,
    ERROR: 5000,
  },
  POSITION: {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right',
  },
};

export const COGNITO_ERROR_CODES = {
  USER_NOT_FOUND: 'UserNotFoundException',
  NOT_AUTHORIZED: 'NotAuthorizedException',
  RESOURCE_NOT_FOUND: 'ResourceNotFoundException',
  USER_NOT_CONFIRMED: 'UserNotConfirmedException',
  USERNAME_EXISTS: 'UsernameExistsException',
  INVALID_PASSWORD: 'InvalidPasswordException',
  LIMIT_EXCEEDED: 'LimitExceededException',
  TOO_MANY_REQUESTS: 'TooManyRequestsException',
  INVALID_PARAMETER: 'InvalidParameterException',
  CODE_MISMATCH: 'CodeMismatchException',
  EXPIRED_CODE: 'ExpiredCodeException',
  CLIENT_NOT_FOUND: 'ResourceNotFoundException', // Cognito有時會針對Client ID錯誤返回這個
};

export const AUTH_PATHS = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  CHANGE_PASSWORD: '/change-password',
  OPTIONS: '/options'
};

/**
 * 根據活動類型返回對應的 Lucide 圖標
 * @param type 活動類型
 * @returns Lucide 圖標組件
 */
// 由於 components/Dashboard.tsx 中使用了 icon，但 lucide-react 並未在此文件中導入，
// 為了避免 lint 錯誤，我們將這個函數的實現移至使用它的地方或更高層的組件中。
// export const getActivityIcon = (type: string) => { ... };

/**
 * 根據狀態返回對應的顏色 class
 * @param status 狀態字符串
 * @returns Tailwind CSS 顏色 class
 */
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'busy':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
};

/**
 * 根據狀態返回對應的文本
 * @param status 狀態字符串
 * @returns 狀態文本
 */
export const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '在線上';
    case 'away':
      return '離開';
    case 'busy':
      return '忙碌中';
    default:
      return '離線';
  }
};

export const USER = 'user';
export const TEAM = 'team';

/**
 * 格式化日期為本地化格式
 * @param dateString 日期字符串（YYYY-MM-DD 格式或 ISO 格式）
 * @returns 格式化後的日期字符串
 */
export const formatJoinDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // 如果無法解析，返回原始值
    }
    
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('日期格式化錯誤:', error);
    return dateString; // 如果出錯，返回原始值
  }
};

/**
 * 獲取當前日期，格式為 YYYY-MM-DD
 * @returns 當前日期字符串
 */
export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
}; 