import React, { useState, useEffect } from 'react';
import { 
  History, 
  GitBranch, 
  RotateCcw, 
  Eye, 
  Download,
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Version } from '@/types';
import { showSuccess, showError } from '@/utils/notification';

interface FileVersionHistoryProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onVersionSelect?: (version: Version) => void;
}

const FileVersionHistory: React.FC<FileVersionHistoryProps> = ({
  documentId,
  isOpen,
  onClose,
  onVersionSelect
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  // 載入版本歷史
  const loadVersions = async () => {
    setLoading(true);
    try {
      // TODO: 實現版本 API
      const mockVersions: Version[] = [
        {
          id: 'v1',
          version: '1.0.0',
          author: '張工程師',
          date: '2024-03-20 10:30',
          message: '初始版本',
          changes: ['創建文件', '添加基本內容'],
          status: 'published'
        },
        {
          id: 'v2',
          version: '1.1.0',
          author: '李設計師',
          date: '2024-03-21 14:15',
          message: '更新操作流程',
          changes: ['修改步驟 3', '添加截圖說明'],
          status: 'published'
        },
        {
          id: 'v3',
          version: '1.2.0',
          author: '張工程師',
          date: '2024-03-22 09:45',
          message: '修復錯誤描述',
          changes: ['修正錯誤訊息', '更新聯絡資訊'],
          status: 'draft'
        }
      ];
      setVersions(mockVersions);
    } catch (error) {
      console.error('載入版本歷史失敗:', error);
      showError('載入版本歷史失敗');
    } finally {
      setLoading(false);
    }
  };

  // 回滾到指定版本
  const rollbackToVersion = async (version: Version) => {
    try {
      // TODO: 實現回滾 API
      showSuccess(`已回滾到版本 ${version.version}`);
      onClose();
    } catch (error) {
      console.error('回滾失敗:', error);
      showError('回滾失敗');
    }
  };

  // 下載版本
  const downloadVersion = async (version: Version) => {
    try {
      // TODO: 實現下載 API
      showSuccess(`正在下載版本 ${version.version}`);
    } catch (error) {
      console.error('下載失敗:', error);
      showError('下載失敗');
    }
  };

  useEffect(() => {
    if (isOpen && documentId) {
      loadVersions();
    }
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* 標題欄 */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              版本歷史
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ×
          </button>
        </div>

        {/* 內容區域 */}
        <div className="flex-1 overflow-hidden flex">
          {/* 版本列表 */}
          <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedVersion?.id === version.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {version.version}
                          </span>
                          {version.status === 'published' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadVersion(version);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {version.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{version.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{version.date}</span>
                        </div>
                      </div>
                      
                      {version.changes.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            變更內容:
                          </h4>
                          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                            {version.changes.map((change, index) => (
                              <li key={index} className="flex items-start space-x-1">
                                <span className="text-indigo-500">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 版本詳情 */}
          <div className="w-1/2 flex flex-col">
            {selectedVersion ? (
              <>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      版本 {selectedVersion.version} 詳情
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowDiff(!showDiff)}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{showDiff ? '隱藏' : '顯示'}差異</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        版本訊息
                      </label>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {selectedVersion.message}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        作者
                      </label>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {selectedVersion.author}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        建立時間
                      </label>
                      <p className="text-sm text-slate-900 dark:text-white mt-1">
                        {selectedVersion.date}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        狀態
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        {selectedVersion.status === 'published' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              已發布
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-amber-600 dark:text-amber-400">
                              草稿
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-medium text-slate-900 dark:text-white">
                      變更內容
                    </h4>
                    <button
                      onClick={() => rollbackToVersion(selectedVersion)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>回滾到此版本</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedVersion.changes.map((change, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <span className="text-indigo-500 text-sm">•</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    選擇一個版本查看詳情
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileVersionHistory; 