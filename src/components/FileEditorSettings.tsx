import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Type, 
  Palette, 
  Clock, 
  Eye,
  Download,
  Share2,
  Lock,
  Globe
} from 'lucide-react';

interface FileEditorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    autoSave: boolean;
    autoSaveInterval: number;
    theme: 'light' | 'dark' | 'auto';
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    showLineNumbers: boolean;
    wordWrap: boolean;
    spellCheck: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

const FileEditorSettings: React.FC<FileEditorSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      autoSave: true,
      autoSaveInterval: 30000,
      theme: 'auto' as const,
      fontSize: 14,
      fontFamily: 'Inter',
      lineHeight: 1.6,
      showLineNumbers: false,
      wordWrap: true,
      spellCheck: true
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 標題欄 */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              編輯器設定
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* 自動儲存設定 */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center">
                <Save className="h-5 w-5 mr-2 text-indigo-600" />
                自動儲存
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      啟用自動儲存
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      自動儲存文件變更
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoSave', !localSettings.autoSave)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                      localSettings.autoSave ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        localSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {localSettings.autoSave && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      自動儲存間隔
                    </label>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="range"
                        min="10000"
                        max="120000"
                        step="10000"
                        value={localSettings.autoSaveInterval}
                        onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 w-16">
                        {localSettings.autoSaveInterval / 1000}秒
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 外觀設定 */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-indigo-600" />
                外觀
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    主題
                  </label>
                  <select
                    value={localSettings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="light">淺色</option>
                    <option value="dark">深色</option>
                    <option value="auto">跟隨系統</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    字體大小
                  </label>
                  <div className="flex items-center space-x-3 mt-2">
                    <input
                      type="range"
                      min="12"
                      max="20"
                      step="1"
                      value={localSettings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-12">
                      {localSettings.fontSize}px
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    字體
                  </label>
                  <select
                    value={localSettings.fontFamily}
                    onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Source Code Pro">Source Code Pro</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    行高
                  </label>
                  <div className="flex items-center space-x-3 mt-2">
                    <input
                      type="range"
                      min="1.2"
                      max="2.0"
                      step="0.1"
                      value={localSettings.lineHeight}
                      onChange={(e) => handleSettingChange('lineHeight', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-12">
                      {localSettings.lineHeight}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 編輯器設定 */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center">
                <Type className="h-5 w-5 mr-2 text-indigo-600" />
                編輯器
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      顯示行號
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      在編輯器左側顯示行號
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('showLineNumbers', !localSettings.showLineNumbers)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                      localSettings.showLineNumbers ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        localSettings.showLineNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      自動換行
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      長行自動換行顯示
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('wordWrap', !localSettings.wordWrap)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                      localSettings.wordWrap ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        localSettings.wordWrap ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      拼字檢查
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      檢查拼字錯誤
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('spellCheck', !localSettings.spellCheck)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                      localSettings.spellCheck ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        localSettings.spellCheck ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            重置為預設
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              儲存設定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileEditorSettings; 