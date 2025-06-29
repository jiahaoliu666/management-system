import { useState, useEffect } from 'react';
import { fileOptionsApi } from '@/lib/api/apiClient';

interface FileOptions {
  categories: string[];
  tags: string[];
}

export const useFileOptions = () => {
  const [options, setOptions] = useState<FileOptions>({
    categories: [],
    tags: []
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
      // 如果獲取失敗，使用預設選項
      setOptions({
        categories: ['document', 'code', 'note', 'report'],
        tags: []
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