import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { CognitoUser, CognitoUserSession, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { useCognito, MFAType } from '@/lib/hooks/useCognito';
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
  completeNewPassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  getToken: () => Promise<string | null>;
  newPasswordRequired: boolean;
  cancelNewPasswordChallenge: () => void;
  // MFA 相關
  mfaRequired: boolean;
  mfaType: MFAType;
  verifyMfaCode: (mfaCode: string) => Promise<boolean>;
  selectMfaType: (mfaType: MFAType) => Promise<boolean>;
  getUserMfaSettings: () => Promise<{
    success: boolean;
    preferredMfa?: string;
    mfaOptions?: any[];
    enabled?: boolean;
  }>;
  setupTotpMfa: () => Promise<{
    success: boolean;
    secretCode?: string;
    qrCodeUrl?: string;
  }>;
  verifyAndEnableTotpMfa: (totpCode: string, deviceName?: string) => Promise<boolean>;
  setupSmsMfa: () => Promise<boolean>;
  disableMfa: () => Promise<boolean>;
  mfaSecret: string;
  mfaSecretQRCode: string;
  // 安全設置進度相關
  isFirstLogin: boolean;
  setIsFirstLogin: (isFirst: boolean) => void;
  currentSetupStep: 'password' | 'mfa' | 'complete';
  setCurrentSetupStep: (step: 'password' | 'mfa' | 'complete') => void;
  isMfaSetupRequired: boolean;
  setIsMfaSetupRequired: (required: boolean) => void;
  completeSetup: () => void;
  // 新增：清除所有憑證的函數
  clearAllCredentials: () => void;
  isMfaVerified: boolean;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
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
  const [isMfaSetupRequired, setIsMfaSetupRequired] = useState<boolean>(false);
  const [newPasswordRequired, setNewPasswordRequired] = useState<boolean>(false);
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [mfaType, setMfaType] = useState<MFAType>('NOMFA');
  const [error, setError] = useState<string | null>(null);
  
  // 首次登入與安全設置進度相關狀態
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cognito_first_login') === 'true';
    }
    return false;
  });
  const [currentSetupStep, setCurrentSetupStep] = useState<'password' | 'mfa' | 'complete'>('password');
  
  // 新增一個MFA已啟用的狀態，緩存MFA狀態避免頻繁API調用
  const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cognito_mfa_enabled') === 'true';
    }
    return false;
  });
  
  // 在 AuthProvider 組件內添加新的狀態
  const [isMfaVerified, setIsMfaVerified] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cognito_mfa_verified') === 'true';
    }
    return false;
  });
  
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
    completeNewPassword: cognitoCompleteNewPassword,
    loading: cognitoLoading,
    error: cognitoError,
    cancelNewPasswordChallenge: cognitoCancelNewPasswordChallenge,
    // MFA 相關
    verifyMfaCode: cognitoVerifyMfaCode,
    selectMfaType: cognitoSelectMfaType,
    getUserMfaSettings: cognitoGetUserMfaSettings,
    setupTotpMfa: cognitoSetupTotpMfa,
    verifyAndEnableTotpMfa: cognitoVerifyAndEnableTotpMfa,
    setupSmsMfa: cognitoSetupSmsMfa,
    disableMfa: cognitoDisableMfa,
    mfaSecret: cognitoMfaSecret,
    mfaSecretQRCode: cognitoMfaSecretQRCode
  } = useCognito();

  const router = useRouter();

  // 清除所有憑證的函數
  const clearAllCredentials = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setChallengeUser(null);
    setNewPasswordRequired(false);
    setMfaRequired(false);
    setIsMfaSetupRequired(false);
    setMfaType('NOMFA');
    setIsMfaVerified(false);
    setEmail('');
    
    clearAllCognitoLocalStorage();
  }, []);

  // 更新安全設置進度
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognito_first_login', isFirstLogin.toString());
      localStorage.setItem('cognito_setup_step', currentSetupStep);
      localStorage.setItem('cognito_mfa_setup_required', isMfaSetupRequired.toString());
    }
  }, [isFirstLogin, currentSetupStep, isMfaSetupRequired]);

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

  const handleGetUserMfaSettings = useCallback(async () => {
    try {
      const result = await cognitoGetUserMfaSettings();
      
      // 如果成功獲取MFA設置，更新本地狀態和存儲
      if (result.success) {
        const isEnabled = result.enabled || false;
        setIsMfaEnabled(isEnabled);
        
        // 同步到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('cognito_mfa_enabled', isEnabled.toString());
        }
      }
      
      return result;
    } catch (error) {
      console.error('Get MFA settings error:', error);
      return { success: false };
    }
  }, [cognitoGetUserMfaSettings]);

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
            // 檢查MFA設置狀態
            handleGetUserMfaSettings().catch(console.error);
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
  }, [clearAllCredentials, email, getCurrentUser, getCurrentSession, handleGetUserMfaSettings]);

  // 登入函數
  const handleLogin = async (username: string, password: string): Promise<void> => {
    setAuthLoading(true);
    setError(null);
    
    // 每次登入都是一個全新的流程，清除所有先前的挑戰狀態
    clearAllCredentials();

    try {
      const result = await signIn(username, password);

      // 情況 1: 登入成功，沒有任何挑戰
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

      // 情況 2: 需要設定新密碼
      if (result.newPasswordRequired && result.user) {
        setChallengeUser(result.user);
        setNewPasswordRequired(true);
        return;
      }

      // 情況 3: 需要 MFA 驗證
      if (result.mfaRequired && result.user) {
        setChallengeUser(result.user);
        setMfaRequired(true);
        setMfaType(result.mfaType || 'NOMFA');
        return;
      }
      
      // 情況 4: 登入成功，但需要強制設定 MFA
      if (result.setupRequired && result.user) {
        setChallengeUser(result.user);
        setIsMfaSetupRequired(true); // 直接進入 MFA 設定流程
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

  // 驗證 MFA 碼
  const handleVerifyMfaCode = async (mfaCode: string): Promise<boolean> => {
    if (!challengeUser) {
      showError('會話已過期，請重新登入');
      clearAllCredentials();
      router.push('/login');
      return false;
    }
    
    try {
      const result = await cognitoVerifyMfaCode(mfaCode, mfaType);
      
      if (result.success && result.session) {
        await saveTokenToStorage(result.session);
        
        setIsAuthenticated(true);
        setUser(getCurrentUser());
        setIsMfaVerified(true);
        
        // 清理流程狀態
        setMfaRequired(false);
        setChallengeUser(null);
        setMfaType('NOMFA');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  };

  // 選擇 MFA 類型
  const handleSelectMfaType = async (mfaType: MFAType): Promise<boolean> => {
    if (!challengeUser) {
      showError('會話已過期，請重新登入');
      clearAllCredentials();
      router.push('/login');
      return false;
    }
    try {
      // 在 useCognito 中，我們已不再依賴此函數來處理狀態，
      // 但保留它以備將來可能的擴展
      // 目前主要由 handleLogin 的 mfaType 決定
      return true;
    } catch (error) {
      console.error('Select MFA type error:', error);
      return false;
    }
  };

  // 設置 TOTP MFA
  const handleSetupTotpMfa = async () => {
    try {
      const userForMfa = challengeUser;
      if (!userForMfa) {
        throw new Error("無法設定MFA：使用者挑戰會話不存在。");
      }
      return await cognitoSetupTotpMfa(userForMfa);
    } catch (error) {
      console.error('Setup TOTP MFA error:', error);
      showError('無法設定驗證器，請重新登入再試。');
      return { success: false };
    }
  };

  // 驗證並啟用 TOTP MFA
  const handleVerifyAndEnableTotpMfa = async (totpCode: string, deviceName?: string): Promise<boolean> => {
    try {
      const userForMfa = challengeUser;
      if (!userForMfa) {
        throw new Error("無法驗證MFA：使用者挑戰會話不存在。");
      }
      const result = await cognitoVerifyAndEnableTotpMfa(userForMfa, totpCode, deviceName);
      
      if (result.success) {
        // MFA 設置流程成功後，清理所有相關挑戰狀態
        setIsMfaSetupRequired(false);
        setNewPasswordRequired(false); // 以防萬一
        setChallengeUser(null);
        setIsMfaEnabled(true); // 更新MFA啟用狀態

        showSuccess('MFA 設定成功！請使用您的新密碼及驗證碼重新登入。');

        // 使用 setTimeout 確保用戶能看到成功訊息
        setTimeout(() => {
          // 只需清理狀態並導向登入頁，不需要執行完整的登出 (signOut)
          // 因為用戶從未真正「登入」過。
          clearAllCredentials();
          router.push('/login');
        }, 2000); // 延遲 2 秒給用戶閱讀訊息

        return true;
      }
      
      // 失敗的情況，useCognito hook 已經顯示錯誤
      return false;
    } catch (error) {
      console.error('Verify and enable TOTP MFA error:', error);
      showError('啟用MFA時發生未知錯誤。');
      return false;
    }
  };

  // 設置 SMS MFA
  const handleSetupSmsMfa = async (): Promise<boolean> => {
    try {
      const result = await cognitoSetupSmsMfa();
      
      if (result.success) {
        // 更新MFA啟用狀態
        setIsMfaEnabled(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cognito_mfa_enabled', 'true');
        }
        
        // 如果是首次登入流程，且已完成MFA設置
        if (isFirstLogin && currentSetupStep === 'mfa') {
          completeSetup();
        }
      }
      
      return result.success;
    } catch (error) {
      console.error('Setup SMS MFA error:', error);
      return false;
    }
  };

  // 禁用 MFA
  const handleDisableMfa = async (): Promise<boolean> => {
    try {
      const result = await cognitoDisableMfa();
      
      if (result.success) {
        // 更新MFA禁用狀態
        setIsMfaEnabled(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cognito_mfa_enabled', 'false');
        }
      }
      
      return result.success;
    } catch (error) {
      console.error('Disable MFA error:', error);
      return false;
    }
  };

  // 完成新密碼設置函數
  const handleCompleteNewPassword = async (newPassword: string): Promise<void> => {
    if (!challengeUser) {
      showError('會話已過期，請重新登入');
      clearAllCredentials();
      router.push('/login');
      return;
    }

    setAuthLoading(true);
    try {
      const result = await cognitoCompleteNewPassword(challengeUser, newPassword);
      
      // 情況 1: 密碼設定成功，且需要接著設定 MFA
      if (result.success && result.mfaSetupRequired) {
        setNewPasswordRequired(false);
        setIsMfaSetupRequired(true);
        // challengeUser 仍然保留，給下一步使用
        showSuccess('密碼更新成功！現在請設定 MFA。');
        return;
      }
      
      // 情況 2: 密碼設定成功，流程結束 (已取得 session)
      if (result.success && result.session) {
        await saveTokenToStorage(result.session);
        setIsAuthenticated(true);
        setUser(getCurrentUser());
        
        // 清理所有挑戰狀態
        setNewPasswordRequired(false);
        setIsMfaSetupRequired(false);
        setChallengeUser(null);
        
        showSuccess('密碼設定成功！');
        return;
      }

      // 情況 3: 失敗
      // 錯誤已由 useCognito hook 顯示
      clearAllCredentials();
      router.push('/login');

    } catch (error) {
      console.error('AuthContext: 完成新密碼過程中發生錯誤:', error);
      showError('設置新密碼時發生未知錯誤，請重試。');
      clearAllCredentials();
      router.push('/login');
    } finally {
      setAuthLoading(false);
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
    setIsMfaSetupRequired(false);
    setNewPasswordRequired(false);
    setChallengeUser(null);
  }, [cognitoCancelNewPasswordChallenge]);

  const memoizedValue = useMemo(() => ({
    isAuthenticated,
    user,
    login: handleLogin,
    completeNewPassword: handleCompleteNewPassword,
    logout: handleLogout,
    loading,
    error: error || cognitoError,
    getToken: handleGetToken,
    newPasswordRequired,
    cancelNewPasswordChallenge: handleCancelNewPasswordChallenge,
    mfaRequired,
    mfaType,
    verifyMfaCode: handleVerifyMfaCode,
    selectMfaType: handleSelectMfaType,
    getUserMfaSettings: handleGetUserMfaSettings,
    setupTotpMfa: handleSetupTotpMfa,
    verifyAndEnableTotpMfa: handleVerifyAndEnableTotpMfa,
    setupSmsMfa: handleSetupSmsMfa,
    disableMfa: handleDisableMfa,
    mfaSecret: cognitoMfaSecret,
    mfaSecretQRCode: cognitoMfaSecretQRCode,
    isFirstLogin,
    setIsFirstLogin,
    currentSetupStep,
    setCurrentSetupStep,
    isMfaSetupRequired,
    setIsMfaSetupRequired,
    completeSetup,
    clearAllCredentials,
    isMfaVerified,
    email,
    setEmail
  }), [
    isAuthenticated, user, handleLogin, handleCompleteNewPassword, handleLogout,
    loading, error, cognitoError, handleGetToken, newPasswordRequired,
    handleCancelNewPasswordChallenge, mfaRequired, mfaType, handleVerifyMfaCode,
    handleSelectMfaType, handleGetUserMfaSettings, handleSetupTotpMfa,
    handleVerifyAndEnableTotpMfa, handleSetupSmsMfa, handleDisableMfa,
    cognitoMfaSecret, cognitoMfaSecretQRCode, isFirstLogin, currentSetupStep,
    isMfaSetupRequired, completeSetup, clearAllCredentials, isMfaVerified, email
  ]);

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}; 