import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '@/auth/AuthContext';
import { showError } from '@/utils/notification';
import { QRCodeSVG } from 'qrcode.react';

export default function MfaSetupPage() {
  const { 
    setupTotpMfa, 
    verifyAndEnableTotpMfa, 
    loading: authLoading 
  } = useAuth();

  const [mfaQr, setMfaQr] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleSetup = async () => {
      setLoading(true);
      const result = await setupTotpMfa();
      if (result.success && result.qrCodeUrl) {
        setMfaQr(result.qrCodeUrl);
      } else {
        showError('無法設定驗證器 App，請稍後再試');
      }
      setLoading(false);
    };
    
    handleSetup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 僅在組件掛載時執行一次

  const handleVerifyTotp = async () => {
    setLoading(true);
    const success = await verifyAndEnableTotpMfa(totpCode);
    if (!success) {
      showError('驗證失敗，請檢查驗證碼是否正確');
    }
    // 成功的導向由 AuthContext 處理
    setLoading(false);
  };
  
  const combinedLoading = loading || authLoading;

  return (
    <>
      <Head>
        <title>設定 MFA 驗證</title>
        <meta name="description" content="請設定您的多因素驗證 (MFA) 以增強帳戶安全性。" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-90">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">設置驗證器 App</h1>
                <p className="text-gray-600">請使用驗證器 App 掃描 QR code</p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-center">
                  {!mfaQr ? (
                    <div className="text-gray-500">正在生成 QR Code...</div>
                  ) : (
                    <div className="bg-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
                      <QRCodeSVG value={mfaQr} size={200} level="H" includeMargin={true} />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center text-lg tracking-widest"
                    placeholder="請輸入 6 位數驗證碼"
                    maxLength={6}
                    disabled={combinedLoading}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyTotp}
                  disabled={!totpCode || combinedLoading || !mfaQr}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {combinedLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      驗證中...
                    </div>
                  ) : '啟用 MFA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 