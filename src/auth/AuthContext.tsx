import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { CognitoUser, CognitoUserSession, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { useCognito } from '@/lib/hooks/useCognito';
import { showError, showInfo, showSuccess } from '@/utils/notification';
import { useRouter } from 'next/router';

const clearAllCognitoLocalStorage = () => {
  if (typeof window === 'undefined') return;
  
  const keysToRemove = [
    // Session tokens
    'cognito_id_token', 'cognito_access_token', 'cognito_refresh_token',
    // User state
    'cognito_username', 'cognito_password', 'cognito_email',
    // Challenge/Flow state
    'cognito_new_password_required', 'cognito_mfa_required', 'cognito_mfa_type',
    'cognito_mfa_options', 'cognito_mfa_verified', 'cognito_challenge_session',
    // First login setup flow state
    'cognito_first_login', 'cognito_setup_step', 'cognito_mfa_setup_required',
    'cognito_mfa_enabled',
    // Session validation
    'cognito_session_valid', 'cognito_last_session_time'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: CognitoUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  getToken: () => Promise<string | null>;
  newPasswordRequired: boolean;
  cancelNewPasswordChallenge: () => void;
  isFirstLogin: boolean;
  setIsFirstLogin: (isFirst: boolean) => void;
  currentSetupStep: 'password' | 'complete';
  setCurrentSetupStep: (step: 'password' | 'complete') => void;
  completeSetup: () => void;
  clearAllCredentials: () => void;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  completeNewPassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 自定義Hook來使用AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必須在AuthProvider內使用');
  }
  return context;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [challengeUser, setChallengeUser] = useState<CognitoUser | null>(null);
  const [newPasswordRequired, setNewPasswordRequired] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 首次登入與安全設置進度相關狀態
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cognito_first_login') === 'true';
    }
    return false;
  });
  const [currentSetupStep, setCurrentSetupStep] = useState<'password' | 'complete'>('password');
  
  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cognito_email') || '';
    }
    return '';
  });
  
  const {
    signIn,
    signOut,
    getCurrentUser,
    getCurrentSession,
    getJwtToken,
    confirmNewPassword,
    loading: cognitoLoading,
    error: cognitoError,
    cancelNewPasswordChallenge: cognitoCancelNewPasswordChallenge
  } = useCognito();

  const router = useRouter();

  // 清除所有憑證的函數
  const clearAllCredentials = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setChallengeUser(null);
    setNewPasswordRequired(false);
    setIsFirstLogin(false);
    setCurrentSetupStep('password');
    setEmail('');
    
    clearAllCognitoLocalStorage();
  }, []);

  // 更新安全設置進度
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognito_first_login', isFirstLogin.toString());
      localStorage.setItem('cognito_setup_step', currentSetupStep);
    }
  }, [isFirstLogin, currentSetupStep]);

  // 保存令牌到 localStorage
  const saveTokenToStorage = async (session: CognitoUserSession) => {
    try {
      const idToken = session.getIdToken().getJwtToken();
      localStorage.setItem('cognito_id_token', idToken);
      
      // 如果需要，也可以存儲access token和refresh token
      // const accessToken = session.getAccessToken().getJwtToken();
      // localStorage.setItem('cognito_access_token', accessToken);
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  };

  // 從 localStorage 清除令牌
  const clearTokenFromStorage = () => {
    localStorage.removeItem('cognito_id_token');
    // localStorage.removeItem('cognito_access_token');
  };

  // 在組件掛載時檢查用戶的身份驗證狀態和MFA設置
  useEffect(() => {
    const checkAuthStatus = async () => {
      setAuthLoading(true); // 開始時設定為載入中
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          const session = await getCurrentSession();
          if (session && session.isValid()) {
            // 保存令牌
            await saveTokenToStorage(session);
            setIsAuthenticated(true);
            setUser(currentUser);
            // 檢查 email 狀態，若為空則主動撈取
            if (!email) {
              currentUser.getUserAttributes((err: any, attributes: any) => {
                if (!err && attributes) {
                  const emailAttr = attributes.find((attr: any) => attr.getName() === 'email');
                  if (emailAttr) {
                    setEmail(emailAttr.getValue());
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('cognito_email', emailAttr.getValue());
                    }
                  }
                }
              });
            }
          } else {
            // 如果會話無效，則只清理憑證，不觸發登出或重定向
            clearAllCredentials();
          }
        }
      } catch (error) {
        console.log('checkAuthStatus: No valid session found.', error);
        // 這通常不是一個錯誤，只是代表用戶未登入。清理所有狀態以確保一致。
        clearAllCredentials();
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuthStatus();
  }, [clearAllCredentials, email, getCurrentUser, getCurrentSession]);

  // 登入函數
  const handleLogin = async (username: string, password: string): Promise<void> => {
    setAuthLoading(true);
    setError(null);
    clearAllCredentials();
    try {
      const result = await signIn(username, password);
      if (result.success && result.session) {
        await saveTokenToStorage(result.session);
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        if (currentUser) {
           currentUser.getUserAttributes((err: any, attributes: any) => {
              if (!err && attributes) {
                const emailAttr = attributes.find((attr: any) => attr.getName() === 'email');
                if (emailAttr) setEmail(emailAttr.getValue());
              }
            });
        }
        return;
      }
      if (result.newPasswordRequired && result.user) {
        setChallengeUser(result.user);
        setNewPasswordRequired(true);
        return;
      }
      // 其他失敗情況已由 useCognito 處理 (showError)
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      clearAllCredentials();
    } finally {
      setAuthLoading(false);
    }
  };

  // 完成安全設置流程
  const completeSetup = () => {
    setIsFirstLogin(false);
    setCurrentSetupStep('complete');
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognito_first_login', 'false');
      localStorage.setItem('cognito_setup_step', 'complete');
    }
  };

  // 登出函數
  const handleLogout = useCallback(() => {
    // 清除所有狀態
    clearAllCredentials();
    
    // 調用 Cognito 的登出函數
    signOut();
    router.push('/login');
  }, [signOut, router, clearAllCredentials]);

  // 獲取 JWT 令牌函數
  const handleGetToken = async (): Promise<string | null> => {
    // 先嘗試從 localStorage 獲取令牌
    const storedToken = localStorage.getItem('cognito_id_token');
    if (storedToken) {
      return storedToken;
    }
    
    // 如果 localStorage 中沒有令牌，則從會話獲取
    const token = await getJwtToken();
    if (token) {
      localStorage.setItem('cognito_id_token', token);
    }
    
    return token;
  };

  // 合併加載狀態
  const loading = authLoading || cognitoLoading;

  // 專門處理取消新密碼挑戰
  const handleCancelNewPasswordChallenge = useCallback(() => {
    // 首先調用 Cognito Hook 的取消函數
    cognitoCancelNewPasswordChallenge();
    
    // 同步更新 AuthContext 的狀態
    setIsFirstLogin(false);
    setCurrentSetupStep('password');
    setNewPasswordRequired(false);
    setChallengeUser(null);
  }, [cognitoCancelNewPasswordChallenge]);

  // 新增 handleCompleteNewPassword
  const handleCompleteNewPassword = async (newPassword: string): Promise<void> => {
    if (!challengeUser) {
      showError('會話已過期，請重新登入');
      clearAllCredentials();
      router.push('/login');
      return;
    }
    setAuthLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        challengeUser.completeNewPasswordChallenge(newPassword, {}, {
          onSuccess: async () => {
            setNewPasswordRequired(false);
            setChallengeUser(null);
            showSuccess('密碼設定成功，請重新登入！');
            router.push('/login');
            resolve();
          },
          onFailure: (err) => {
            showError(err.message || '設置新密碼時發生錯誤');
            clearAllCredentials();
            router.push('/login');
            reject(err);
          }
        });
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const memoizedValue = useMemo(() => ({
    isAuthenticated,
    user,
    login: handleLogin,
    logout: handleLogout,
    loading,
    error: error || cognitoError,
    getToken: handleGetToken,
    newPasswordRequired,
    cancelNewPasswordChallenge: handleCancelNewPasswordChallenge,
    isFirstLogin,
    setIsFirstLogin,
    currentSetupStep,
    setCurrentSetupStep,
    completeSetup,
    clearAllCredentials,
    email,
    setEmail,
    completeNewPassword: handleCompleteNewPassword
  }), [
    isAuthenticated, user, handleLogin, handleLogout,
    loading, error, cognitoError, handleGetToken, newPasswordRequired,
    handleCancelNewPasswordChallenge, isFirstLogin, currentSetupStep,
    completeSetup, clearAllCredentials, email
  ]);

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}; 