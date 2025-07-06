import { useState, useEffect } from 'react';
import { fileOptionsApi } from '@/lib/api/apiClient';

interface FileOptions {
  categories: string[];
  tags: string[];
}

// 默認選項
const DEFAULT_CATEGORIES = ['文件', '檔案', '簡報', '外部連結'];
const DEFAULT_TAGS = ['一般文件', '技術文件', 'SOP', '連結', '外部文件'];

export const useFileOptions = () => {
  const [options, setOptions] = useState<FileOptions>({
    categories: DEFAULT_CATEGORIES,
    tags: DEFAULT_TAGS
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fileOptionsApi.getOptions();
      setOptions(response.data);
    } catch (e: any) {
      setError(e.message || '獲取選項失敗');
      // 如果獲取失敗，使用默認選項
      setOptions({
        categories: DEFAULT_CATEGORIES,
        tags: DEFAULT_TAGS
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return {
    categories: options.categories,
    tags: options.tags,
    loading,
    error,
    refetch: fetchOptions
  };
}; 