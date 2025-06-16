import type { TreeData } from '@/types/management'

export const treeData: TreeData[] = [
  {
    id: 'root',
    name: '根目錄',
    type: 'folder',
    isProtected: false,
    children: [
      {
        id: 'ops',
        name: '營運部門',
        type: 'folder',
        isProtected: false,
        children: [
          {
            id: 'aws',
            name: 'AWS',
            type: 'folder',
            isProtected: false,
            children: [
              {
                id: '1',
                name: 'AWS架構設計.pdf',
                type: 'pdf',
                size: '2.5MB',
                lastModified: '2024-03-20',
                author: '張三',
                category: '技術文檔',
                status: 'active',
                version: '1.0',
                tags: ['AWS', '架構'],
                downloads: 120,
                views: 350,
                isStarred: true,
                isLocked: false
              },
              {
                id: '2',
                name: 'AWS最佳實踐指南.docx',
                type: 'docx',
                size: '1.8MB',
                lastModified: '2024-03-19',
                author: '李四',
                category: '技術文檔',
                status: 'active',
                version: '2.1',
                tags: ['AWS', '最佳實踐'],
                downloads: 85,
                views: 210,
                isStarred: false,
                isLocked: false
              }
            ]
          },
          {
            id: 'azure',
            name: 'Azure',
            type: 'folder',
            isProtected: false,
            children: [
              {
                id: '3',
                name: 'Azure架構設計.pdf',
                type: 'pdf',
                size: '3.2MB',
                lastModified: '2024-03-18',
                author: '王五',
                category: '技術文檔',
                status: 'active',
                version: '1.0',
                tags: ['Azure', '架構'],
                downloads: 65,
                views: 180,
                isStarred: false,
                isLocked: false
              }
            ]
          }
        ]
      },
      {
        id: 'dev',
        name: '開發部門',
        type: 'folder',
        isProtected: false,
        children: [
          {
            id: 'frontend',
            name: '前端',
            type: 'folder',
            isProtected: false,
            children: [
              {
                id: '4',
                name: '前端開發規範.md',
                type: 'md',
                size: '0.5MB',
                lastModified: '2024-03-17',
                author: '趙六',
                category: '開發文檔',
                status: 'active',
                version: '1.0',
                tags: ['前端', '規範'],
                downloads: 150,
                views: 420,
                isStarred: true,
                isLocked: false
              }
            ]
          },
          {
            id: 'backend',
            name: '後端',
            type: 'folder',
            isProtected: false,
            children: [
              {
                id: '5',
                name: 'API文檔.pdf',
                type: 'pdf',
                size: '1.2MB',
                lastModified: '2024-03-16',
                author: '錢七',
                category: 'API文檔',
                status: 'active',
                version: '1.0',
                tags: ['API', '文檔'],
                downloads: 200,
                views: 580,
                isStarred: false,
                isLocked: false
              }
            ]
          }
        ]
      }
    ]
  }
] 