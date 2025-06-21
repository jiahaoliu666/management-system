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
    newPasswordRequired, 
    mfaRequired,
    isMfaSetupRequired
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // 在 AuthContext 確定狀態前，不執行任何操作

    const isPublicPage = publicPaths.includes(router.pathname);
    const isChangePasswordPage = router.pathname === AUTH_PATHS.CHANGE_PASSWORD;
    const isMfaSetupPage = router.pathname === AUTH_PATHS.MFA_SETUP;

    // 流程 1: 需要設定新密碼
    // 如果需要設定新密碼，但不在設定頁面，強制跳轉
    if (newPasswordRequired && !isChangePasswordPage) {
      router.push(AUTH_PATHS.CHANGE_PASSWORD);
      return;
    }
    // 如果在正確的頁面，則允許停留
    if (newPasswordRequired && isChangePasswordPage) {
      return;
    }

    // 流程 2: 需要設定 MFA
    // 如果需要設定 MFA，但不在設定頁面，強制跳轉
    if (isMfaSetupRequired && !isMfaSetupPage) {
      router.push(AUTH_PATHS.MFA_SETUP);
      return;
    }
    // 如果在正確的頁面，則允許停留
    if (isMfaSetupRequired && isMfaSetupPage) {
      return;
    }

    // 流程 3: 需要 MFA 驗證
    // MFA 驗證是在登入頁面完成的，所以確保用戶在登入頁
    if (mfaRequired && router.pathname !== AUTH_PATHS.LOGIN) {
      router.push(AUTH_PATHS.LOGIN);
      return;
    }
    // 如果在登入頁，允許停留以輸入 MFA
    if (mfaRequired && router.pathname === AUTH_PATHS.LOGIN) {
      return;
    }

    // 情況 4: 未登入用戶訪問受保護頁面
    // 如果用戶未通過驗證，且沒有任何待處理的挑戰，也不是在公開頁面，則跳轉到登入頁
    if (!isAuthenticated && !isPublicPage) {
      router.push(AUTH_PATHS.LOGIN);
      return;
    }

    // 情況 5: 已登入用戶訪問公開頁面（如登入頁）
    // 如果用戶已通過驗證，但試圖訪問登入頁等公開頁面，則將他們導向主頁
    if (isAuthenticated && isPublicPage) {
      router.replace('/');
      return;
    }

  }, [
    isAuthenticated,
    loading,
    newPasswordRequired,
    mfaRequired,
    isMfaSetupRequired,
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
  
  // 在確定了所有狀態之後，如果沒有被重定向，就渲染子組件。
  // 簡化了渲染邏輯，因為 useEffect 已經處理了所有重定向。
  // 如果一個頁面不應該被看到，用戶會被重定向走。
  return <>{children}</>;
}; 