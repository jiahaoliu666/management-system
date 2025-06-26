import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';
import { useSecurityMonitor } from '@/lib/hooks/useSecurityMonitor';
import { AUTH_PATHS } from '@/utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// 不需要身份驗證的頁面路徑
const publicPaths = [AUTH_PATHS.LOGIN, '/signup', '/forgot-password'];

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { 
    isAuthenticated, 
    loading, 
    newPasswordRequired
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 僅在 loading=false 時才做跳轉判斷，避免無限跳轉
    if (loading) return;

    const isPublicPage = publicPaths.includes(router.pathname);

    // 統一 Cognito 驗證流程於 login 頁面
    if (newPasswordRequired && router.pathname !== AUTH_PATHS.LOGIN) {
      router.push(AUTH_PATHS.LOGIN);
      return;
    }
    // 允許在 login 頁面停留進行 Cognito 驗證
    if (newPasswordRequired && router.pathname === AUTH_PATHS.LOGIN) {
      return;
    }

    // 未登入用戶訪問受保護頁面
    if (!isAuthenticated && !isPublicPage) {
      router.push(AUTH_PATHS.LOGIN);
      return;
    }

    // 已登入用戶訪問公開頁面（如登入頁）
    if (isAuthenticated && isPublicPage) {
      router.replace('/');
      return;
    }

  }, [
    isAuthenticated,
    loading,
    newPasswordRequired,
    router.pathname
  ]);

  // 顯示加載指示器
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div>正在加載...</div>
      </div>
    );
  }
  
  return <>{children}</>;
}; 