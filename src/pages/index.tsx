import React, { useState } from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/components/Dashboard';
import DocumentsView from '@/components/DocumentsView';
import EditorView from '@/components/EditorView';
import TeamView from '@/components/TeamView';
import { Document, TeamMember, TeamActivity, Activity } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // 模擬數據
  const recentDocuments: Document[] = [
    {
      id: '1',
      title: '系統架構設計文件',
      category: '技術文檔',
      subcategory: '架構設計',
      tags: ['架構', '設計'],
      author: '張工程師',
      lastModified: '2024-03-20 10:30',
      status: 'active',
      priority: 'high',
      permissions: ['read', 'write', 'admin'],
      fileType: 'document',
      size: 1024,
      views: 120,
      downloads: 45,
      comments: 8,
      versions: []
    },
    {
      id: '2',
      title: '使用者介面設計規範',
      category: '設計文檔',
      subcategory: 'UI設計',
      tags: ['UI', '設計規範'],
      author: '李設計師',
      lastModified: '2024-03-19 15:45',
      status: 'active',
      priority: 'medium',
      permissions: ['read', 'write'],
      fileType: 'document',
      size: 2048,
      views: 85,
      downloads: 32,
      comments: 5,
      versions: []
    }
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      user: '張工程師',
      action: '更新了文件',
      target: '系統架構設計文件',
      time: '10 分鐘前',
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      type: 'document',
      priority: 'high',
      status: 'completed'
    },
    {
      id: '2',
      user: '李設計師',
      action: '評論了文件',
      target: '使用者介面設計規範',
      time: '30 分鐘前',
      icon: MessageSquare,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      type: 'message',
      priority: 'medium',
      status: 'in-progress'
    }
  ];

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: '張工程師',
      role: '資深工程師',
      avatar: '/avatars/engineer.png',
      status: 'online',
      tasks: {
        total: 10,
        completed: 7
      }
    },
    {
      id: '2',
      name: '李設計師',
      role: 'UI/UX 設計師',
      avatar: '/avatars/designer.png',
      status: 'away',
      tasks: {
        total: 8,
        completed: 5
      }
    }
  ];

  const teamActivities: TeamActivity[] = [
    {
      id: '1',
      type: 'message',
      title: '系統架構討論',
      description: '討論新系統的架構設計和技術選型',
      time: '10:30',
      status: 'completed',
      participants: ['張工程師', '李設計師']
    },
    {
      id: '2',
      type: 'meeting',
      title: '週會',
      description: '討論本週工作進度和下週計劃',
      time: '14:00',
      status: 'in-progress',
      participants: ['張工程師', '李設計師', '王經理']
    }
  ];

  const handleDocumentClick = (doc: Document) => {
    console.log('Document clicked:', doc.id);
  };

  const handleSaveContent = () => {
    console.log('Saving content...');
  };

  const handlePublish = () => {
    console.log('Publishing...');
  };

  const handlePreview = () => {
    console.log('Previewing...');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard recentDocuments={recentDocuments} recentActivities={recentActivities} />;
      case 'documents':
        return <DocumentsView documents={recentDocuments} onDocumentClick={handleDocumentClick} />;
      case 'editor':
        return (
          <EditorView
            onSave={handleSaveContent}
            onPublish={handlePublish}
            onPreview={handlePreview}
          />
        );
      case 'team':
        return <TeamView members={teamMembers} activities={teamActivities} />;
      default:
        return <Dashboard recentDocuments={recentDocuments} recentActivities={recentActivities} />;
    }
  };

  return (
    <MainLayout>
      {renderContent()}
    </MainLayout>
  );
}

