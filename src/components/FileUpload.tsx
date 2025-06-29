import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import { uploadApi } from '@/lib/api/apiClient';
import { showSuccess, showError } from '@/utils/notification';

interface FileUploadProps {
  onUploadSuccess: (fileUrl: string, fileName: string) => void;
  onClose: () => void;
  accept?: string;
  maxSize?: number; // MB
  multiple?: boolean;
}

interface UploadedFile {
  originalName: string;
  s3Key: string;
  size: number;
  type: string;
  url: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onClose,
  accept = 'image/*',
  maxSize = 10, // 10MB
  multiple = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    // 檢查檔案大小
    if (file.size > maxSize * 1024 * 1024) {
      return `檔案大小不能超過 ${maxSize}MB`;
    }

    // 檢查檔案類型
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', ''));
        }
        return fileType === type;
      });

      if (!isValidType) {
        return `不支援的檔案類型: ${fileType}`;
      }
    }

    return null;
  };

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    const fileArray = Array.from(files);
    const results: UploadedFile[] = [];

    try {
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          showError(error);
          continue;
        }

        const response = await uploadApi.uploadFile(file);
        if (response.data.success) {
          results.push(...response.data.files);
        }
      }

      if (results.length > 0) {
        setUploadedFiles(prev => [...prev, ...results]);
        showSuccess(`成功上傳 ${results.length} 個檔案`);
        
        // 如果是單一檔案上傳，自動選擇第一個檔案
        if (!multiple && results.length > 0) {
          onUploadSuccess(results[0].url, results[0].originalName);
          onClose();
        }
      }
    } catch (error: any) {
      showError(error.response?.data?.error || '上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
    // 重置 input 值，允許重複選擇相同檔案
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileClick = (file: UploadedFile) => {
    onUploadSuccess(file.url, file.originalName);
    if (!multiple) {
      onClose();
    }
  };

  const handleRemoveFile = async (file: UploadedFile, index: number) => {
    try {
      await uploadApi.deleteFile(file.s3Key);
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
      showSuccess('檔案已刪除');
    } catch (error: any) {
      showError('刪除檔案失敗');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 標題 */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              上傳檔案
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              支援拖拽上傳或點擊選擇檔案
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* 上傳區域 */}
        <div className="flex-1 p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              拖拽檔案到此處或點擊選擇
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              支援 {accept} 格式，最大 {maxSize}MB
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
            >
              {uploading ? '上傳中...' : '選擇檔案'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* 已上傳檔案列表 */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                已上傳檔案
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={file.s3Key}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFileClick(file)}
                        className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                      >
                        選擇
                      </button>
                      <button
                        onClick={() => handleRemoveFile(file, index)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 