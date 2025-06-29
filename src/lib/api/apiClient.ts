import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

// 創建一個API客戶端實例
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 在瀏覽器環境中從 localStorage 獲取認證令牌
    if (typeof window !== 'undefined') {
      try {
        // 這裡需要在實際應用中通過 useAuth 獲取令牌
        // 但由於攔截器在組件外部，因此這裡使用直接從 localStorage 獲取的方式
        const token = localStorage.getItem('cognito_id_token');
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error: unknown) {
        console.error('Error adding auth token to request:', error);
      }
    }
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // 處理401未授權錯誤
    if (error.response?.status === 401) {
      // 發送一個全局事件，讓 AuthContext 處理
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cognito-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// 取得 JWT token（從 localStorage）
export function getJwtToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cognito_id_token');
  }
  return null;
}

// 目錄 API
export const directoryApi = {
  async list() {
    const token = getJwtToken();
    return apiClient.get('/api/folder', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  async create(data: { id: string; name: string; parentId?: string }) {
    const token = getJwtToken();
    return apiClient.post('/api/folder', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  async update(data: { id: string; name: string }) {
    const token = getJwtToken();
    return apiClient.put('/api/folder', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  async remove(data: { id: string }) {
    const token = getJwtToken();
    return apiClient.delete('/api/folder', { data, headers: { Authorization: `Bearer ${token}` } });
  }
};

// 文件 API
export const fileApi = {
  async create(data: { id: string; name: string; parentId?: string; s3Key: string; fileType?: string; content?: string }) {
    const token = getJwtToken();
    return apiClient.post('/api/file', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  async update(data: { id: string; name: string; content?: string; parentId?: string }) {
    const token = getJwtToken();
    return apiClient.put('/api/file', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  async remove(data: { id: string; s3Key: string }) {
    const token = getJwtToken();
    return apiClient.delete('/api/file', { data, headers: { Authorization: `Bearer ${token}` } });
  },
  async get(id: string) {
    const token = getJwtToken();
    return apiClient.get(`/api/file?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  async list(parentId?: string) {
    const token = getJwtToken();
    const params = parentId ? { parentId } : {};
    return apiClient.get('/api/file', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

export default apiClient; 