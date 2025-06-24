import { LucideIcon } from 'lucide-react';

export interface FileTag {
  id: string;
  name: string;
  color: string;
}

export interface FilePermission {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface SearchFilter {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export interface NotificationType {
  type: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface VersionComparison {
  type: string;
  name: string;
}

export interface StatMetric {
  type: string;
  name: string;
  value: string;
  change: string;
}

export interface FileType {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: string;
  count?: number;
  children: FileNode[];
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  type: string;
  priority: string;
  status: string;
}

export interface Version {
  id: string;
  version: string;
  author: string;
  date: string;
  message: string;
  changes: string[];
  status: string;
}

export interface Document {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  lastModified: string;
  author: string;
  status: string;
  priority: string;
  tags: string[];
  permissions: string[];
  fileType: string;
  size: number;
  views: number;
  downloads: number;
  comments: number;
  versions: Version[];
}

export interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  trend?: string;
  color: string;
  bgColor: string;
}

export interface ExpandedFolders {
  [key: string]: boolean;
}

export interface ActivityIconProps {
  className?: string;
}

export interface EditorTool {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  group?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  avatar?: string;
  lastActive?: string;
  tasks?: {
    total: number;
    completed: number;
  };
}

export interface TeamActivity {
  id: string;
  type: 'message' | 'meeting' | 'task' | 'document';
  title: string;
  description: string;
  time: string;
  participants?: string[];
  status?: 'pending' | 'completed' | 'in-progress';
}

// Cognito 用戶相關類型定義
export interface CognitoUserAttribute {
  Name: string;
  Value: string;
}

export interface CognitoUser {
  Username: string;
  Attributes?: CognitoUserAttribute[];
  UserCreateDate?: string;
  UserLastModifiedDate?: string;
  Enabled?: boolean;
  UserStatus?: string;
}

export interface CognitoUserListResponse {
  users: CognitoUser[];
  loading: boolean;
  error?: string;
} 