import { useState, useCallback, useEffect } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';
import { cognitoConfig } from '@/lib/config/cognito';
import { showError, showSuccess, mapCognitoErrorToMessage } from '@/utils/notification';

// 創建用戶池實例（安全化處理）
let userPool: CognitoUserPool | null = null;
if (cognitoConfig.userPoolId && cognitoConfig.clientId) {
  userPool = new CognitoUserPool({
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.clientId
  });
} else {
  if (typeof window !== 'undefined') {
    // 僅於瀏覽器端顯示警告，避免 SSR 報錯
    console.warn('Cognito 配置缺失：UserPoolId 或 ClientId 未設置，Cognito 功能將無法使用。');
  }
}

type CognitoError = {
  code: string;
  name: string;
  message: string;
};

export const useCognito = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentCognitoUser, setCurrentCognitoUser] = useState<CognitoUser | null>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);

  // 檢查用戶認證狀態
  const checkAuthStatus = useCallback(async () => {
    if (!userPool) {
      setUser(null);
      setIsAuthenticated(false);
      setCurrentCognitoUser(null);
      return;
    }
    try {
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        const session = await new Promise<CognitoUserSession | null>((resolve, reject) => {
          currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
            if (err) {
              reject(err);
            } else {
              resolve(session);
            }
          });
        });

        if (session && session.isValid()) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setCurrentCognitoUser(currentUser);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setCurrentCognitoUser(null);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentCognitoUser(null);
      }
    } catch (err) {
      console.error('檢查認證狀態時發生錯誤:', err);
      setUser(null);
      setIsAuthenticated(false);
      setCurrentCognitoUser(null);
    }
  }, []);

  // 在組件掛載時檢查認證狀態
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 登入
  const signIn = useCallback(async (username: string, password: string): Promise<{ 
    success: boolean; 
    session?: CognitoUserSession; 
    newPasswordRequired?: boolean;
    user?: CognitoUser;
  }> => {
    setLoading(true);
    setError(null);
    if (!userPool) {
      setError('環境變數尚未配置完成，請通知系統管理員');
      showError('環境變數尚未配置完成，請通知系統管理員');
      setLoading(false);
      return { success: false };
    }
    
    // 清理所有本地流程控制標記
    if (typeof window !== 'undefined') {
      const keysToClear = [
        'cognito_new_password_required', 'cognito_password', 'cognito_mfa_required',
        'cognito_mfa_type', 'cognito_mfa_options', 'cognito_challenge_session'
      ];
      keysToClear.forEach(key => localStorage.removeItem(key));
    }

    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      setCurrentCognitoUser(cognitoUser);

      // 進行身份驗證
      const result = await new Promise<any>((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (session: CognitoUserSession) => {
            resolve({ session, newPasswordRequired: false });
          },
          onFailure: (err: any) => {
            reject(err);
          },
          newPasswordRequired: (userAttributes: any, requiredAttributes: any) => {
            // 處理首次登入需要更改密碼的情況
            setUserAttributes(userAttributes);
            resolve({ newPasswordRequired: true, user: cognitoUser, userAttributes, requiredAttributes });
          }
        });
      });

      if (result.newPasswordRequired) {
        return { success: false, newPasswordRequired: true, user: result.user };
      }

      showSuccess('登入成功');
      return { success: true, session: result.session };
    } catch (err) {
      const cognitoError = err as CognitoError;
      const message = (err as Error).message || String(err);
      let errorMessage = '登入失敗';

      // 添加錯誤日誌以便調試
      console.log('Cognito Error:', {
        code: cognitoError.code,
        name: cognitoError.name,
        message: message
      });

      // 處理常見的 Cognito 錯誤
      if (cognitoError.name === 'UserNotFoundException' || 
          message.includes('User does not exist')) {
        errorMessage = '請確認電子郵件或密碼是否正確';
      } else if (cognitoError.name === 'NotAuthorizedException' || 
                 message.includes('Incorrect username or password')) {
        // Cognito出於安全考量，將未註冊用戶和密碼錯誤返回相同的錯誤代碼
        errorMessage = '請確認電子郵件或密碼是否正確';
      } else if (cognitoError.name === 'ResourceNotFoundException' || 
                 cognitoError.code === 'ResourceNotFoundException' ||
                 (message.includes('User pool client') && 
                 message.includes('does not exist'))) {
        errorMessage = '認證服務未正確設置，請聯繫工程團隊';
      } else if (cognitoError.name === 'UserNotConfirmedException') {
        errorMessage = '用戶尚未確認';
      } else {
        errorMessage = message || '登入過程發生錯誤';
      }

      setError(errorMessage);
      showError(mapCognitoErrorToMessage(cognitoError.code, message));
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // 登出
  const signOut = useCallback(() => {
    if (!userPool) return;
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
      
      // 清除需要新密碼的標記
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cognito_new_password_required');
        localStorage.removeItem('cognito_username');
        localStorage.removeItem('cognito_challenge_session');
      }
      
      showSuccess('已成功登出');
    }
  }, []);

  // 專門用於從 change-password 頁面取消並返回登入頁面
  const cancelNewPasswordChallenge = useCallback(() => {
    // 清除當前用戶狀態
    setCurrentCognitoUser(null);
    setUserAttributes(null);
    
    // 清除需要新密碼的標記
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cognito_new_password_required');
      localStorage.removeItem('cognito_username');
      localStorage.removeItem('cognito_challenge_session');
    }
  }, []);

  // 獲取當前會話
  const getCurrentSession = useCallback(async (): Promise<CognitoUserSession | null> => {
    if (!userPool) return null;
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) return null;

    try {
      const session = await new Promise<CognitoUserSession>((resolve, reject) => {
        currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
          if (err) {
            reject(err);
            return;
          }
          if (session) {
            resolve(session);
          } else {
            reject(new Error('No session found'));
          }
        });
      });
      
      return session;
    } catch (err) {
      console.error('Error getting current session:', err);
      return null;
    }
  }, []);

  // 獲取當前用戶
  const getCurrentUser = useCallback(() => {
    return userPool?.getCurrentUser() || null;
  }, []);

  // 獲取JWT令牌
  const getJwtToken = useCallback(async (): Promise<string | null> => {
    try {
      const session = await getCurrentSession();
      return session?.getIdToken().getJwtToken() || null;
    } catch (err) {
      console.error('Error getting JWT token:', err);
      return null;
    }
  }, [getCurrentSession]);

  // 註冊新用戶
  const signUp = useCallback(async (
    username: string,
    password: string,
    email: string,
    attributes?: Record<string, string>
  ): Promise<{ success: boolean; result?: any }> => {
    setLoading(true);
    setError(null);

    if (!userPool) {
      setError('環境變數尚未配置完成，請通知系統管理員');
      showError('環境變數尚未配置完成，請通知系統管理員');
      setLoading(false);
      return { success: false };
    }

    try {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email
        })
      ];

      // 添加其他屬性
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          attributeList.push(new CognitoUserAttribute({
            Name: key,
            Value: value
          }));
        });
      }

      const result = await new Promise<any>((resolve, reject) => {
        userPool.signUp(username, password, attributeList, [], (err: any, result: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });

      showSuccess('註冊成功，請檢查您的郵箱進行確認');
      return { success: true, result };
    } catch (err) {
      const cognitoError = err as CognitoError;
      let errorMessage = '註冊失敗';

      // 處理常見的註冊錯誤
      if (cognitoError.code) {
        errorMessage = mapCognitoErrorToMessage(cognitoError.code);
      } else {
        errorMessage = cognitoError.message || '註冊過程發生錯誤';
      }

      setError(errorMessage);
      showError(mapCognitoErrorToMessage(cognitoError.code, cognitoError.message));
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // 重置密碼
  const forgotPassword = useCallback(async (username: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!userPool) {
      setError('環境變數尚未配置完成，請通知系統管理員');
      showError('環境變數尚未配置完成，請通知系統管理員');
      setLoading(false);
      return false;
    }

    try {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      await new Promise<void>((resolve, reject) => {
        cognitoUser.forgotPassword({
          onSuccess: () => {
            resolve();
          },
          onFailure: (err: any) => {
            reject(err);
          }
        });
      });

      showSuccess('重置密碼的驗證碼已發送到您的郵箱');
      return true;
    } catch (err) {
      const cognitoError = err as CognitoError;
      const errorMessage = cognitoError.code 
        ? mapCognitoErrorToMessage(cognitoError.code) 
        : (cognitoError.message || '重置密碼過程發生錯誤');
      
      setError(errorMessage);
      showError(mapCognitoErrorToMessage(cognitoError.code, cognitoError.message));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 確認重置密碼
  const confirmNewPassword = useCallback(async (
    username: string,
    verificationCode: string,
    newPassword: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!userPool) {
      setError('環境變數尚未配置完成，請通知系統管理員');
      showError('環境變數尚未配置完成，請通知系統管理員');
      setLoading(false);
      return false;
    }

    try {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      await new Promise<void>((resolve, reject) => {
        cognitoUser.confirmPassword(verificationCode, newPassword, {
          onSuccess: () => {
            resolve();
          },
          onFailure: (err: any) => {
            reject(err);
          }
        });
      });

      showSuccess('密碼重置成功，請使用新密碼登入');
      return true;
    } catch (err) {
      const cognitoError = err as CognitoError;
      const errorMessage = cognitoError.code 
        ? mapCognitoErrorToMessage(cognitoError.code) 
        : (cognitoError.message || '確認新密碼過程發生錯誤');
      
      setError(errorMessage);
      showError(mapCognitoErrorToMessage(cognitoError.code, cognitoError.message));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    forgotPassword,
    confirmNewPassword,
    cancelNewPasswordChallenge,
    getCurrentUser,
    getCurrentSession,
    getJwtToken,
  };
}; 