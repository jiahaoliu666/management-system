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
  Code
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

export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'meeting':
      return Video;
    case 'task':
      return CheckCircle;
    case 'document':
      return FileText;
    case 'message':
      return MessageSquareIcon;
    default:
      return null;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-emerald-400';
    case 'away':
      return 'bg-amber-400';
    case 'busy':
      return 'bg-red-400';
    case 'offline':
      return 'bg-slate-400';
    default:
      return 'bg-slate-400';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '在線';
    case 'away':
      return '暫時離開';
    case 'busy':
      return '忙碌中';
    case 'offline':
      return '離線';
    default:
      return '未知';
  }
}; 