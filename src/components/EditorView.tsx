import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  ListChecks,
  Link,
  Table,
  Code,
  Image,
  FileText,
  Save,
  Send,
  Eye,
  Tag,
  X
} from 'lucide-react';
import { EditorTool } from '@/types';

interface EditorViewProps {
  onSave: (content: string) => void;
  onPublish: () => void;
  onPreview: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ onSave, onPublish, onPreview }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const editorTools: EditorTool[] = [
    { icon: Bold, label: '粗體', shortcut: 'Ctrl+B', group: 'format' },
    { icon: Italic, label: '斜體', shortcut: 'Ctrl+I', group: 'format' },
    { icon: Underline, label: '底線', shortcut: 'Ctrl+U', group: 'format' },
    { icon: Strikethrough, label: '刪除線', shortcut: 'Ctrl+S', group: 'format' },
    { icon: AlignLeft, label: '靠左對齊', group: 'align' },
    { icon: AlignCenter, label: '置中對齊', group: 'align' },
    { icon: AlignRight, label: '靠右對齊', group: 'align' },
    { icon: ListOrdered, label: '有序列表', group: 'list' },
    { icon: ListChecks, label: '任務列表', group: 'list' },
    { icon: Link, label: '插入連結', group: 'insert' },
    { icon: Table, label: '插入表格', group: 'insert' },
    { icon: Code, label: '插入程式碼', group: 'insert' },
    { icon: Image, label: '插入圖片', group: 'insert' }
  ];

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 標題輸入 */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="輸入文件標題..."
          className="w-full px-4 py-3 text-2xl font-semibold border-0 focus:ring-0 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {/* 分類和標籤 */}
      <div className="flex items-center space-x-4 mb-6">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="">選擇分類...</option>
          <option value="sop">SOP</option>
          <option value="process">流程文件</option>
          <option value="guide">使用指南</option>
          <option value="policy">政策文件</option>
        </select>
        <div className="flex-1 flex items-center space-x-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="新增標籤..."
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
            <button
              onClick={handleAddTag}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <Tag className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 編輯工具欄 */}
      <div className="flex items-center space-x-1 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
        {editorTools.map((tool, index) => (
          <button
            key={index}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            <tool.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* 編輯區域 */}
      <div className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="開始撰寫文件內容..."
          className="w-full h-96 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
        />
      </div>

      {/* 操作按鈕 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSave(content)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors duration-200"
          >
            <Save className="h-4 w-4 mr-2" />
            儲存
          </button>
          <button
            onClick={onPublish}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors duration-200"
          >
            <Send className="h-4 w-4 mr-2" />
            發布
          </button>
        </div>
        <button
          onClick={onPreview}
          className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <Eye className="h-4 w-4 mr-2" />
          預覽
        </button>
      </div>
    </div>
  );
};

export default EditorView; 