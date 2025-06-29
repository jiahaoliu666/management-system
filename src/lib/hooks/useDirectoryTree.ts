import { useState, useEffect, useCallback } from 'react';
import { directoryApi } from '@/lib/api/apiClient';
import { FileNode } from '@/types';

// 將 DynamoDB 扁平資料轉為樹狀結構
function buildTree(items: any[]): FileNode[] {
  const map: Record<string, FileNode> = {};
  const roots: FileNode[] = [];
  
  // 首先創建所有節點的映射
  items.forEach(item => {
    const id = item.PK.S.replace('dir#', '');
    map[id] = {
      id,
      name: item.name.S,
      type: 'folder',
      children: [],
    };
  });
  
  // 然後建立父子關係
  items.forEach(item => {
    const id = item.PK.S.replace('dir#', '');
    const parentId = item.parentId?.S?.replace('dir#', '') || 'root';
    
    if (parentId === 'root' || parentId === id) {
      // 根節點或自引用節點
      roots.push(map[id]);
    } else if (map[parentId]) {
      // 有父節點的節點
      map[parentId].children.push(map[id]);
    } else {
      // 父節點不存在，作為根節點處理
      roots.push(map[id]);
    }
  });
  
  return roots;
}

export function useDirectoryTree() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await directoryApi.list();
      // 假設回傳 { items: [...] }
      setTree(buildTree(res.data.items || []));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // CRUD 操作
  const create = async (data: { id: string; name: string; parentId?: string }) => {
    await directoryApi.create(data);
    await fetchTree();
  };
  const update = async (data: { id: string; name: string }) => {
    await directoryApi.update(data);
    await fetchTree();
  };
  const remove = async (data: { id: string }) => {
    await directoryApi.remove(data);
    await fetchTree();
  };

  return { tree, loading, error, refetch: fetchTree, create, update, remove };
} 