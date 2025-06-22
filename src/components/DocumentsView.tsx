import React, { useState } from 'react';
import { 
  Grid, 
  List, 
  FileText, 
  Star, 
  Share2, 
  MoreVertical,
  Tag,
  Users,
  Clock,
  Eye,
  Download,
  MessageSquare
} from 'lucide-react';
import { Document } from '@/types';

interface DocumentsViewProps {
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ documents, onDocumentClick }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredDocuments = documents.filter(doc => {
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => doc.tags.includes(tag));
    return matchesTags;
  });

  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 工具欄 */}
      <div className="flex items-center justify-end mb-8">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 標籤過濾器 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedTags.includes(tag)
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 文件列表 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              onClick={() => onDocumentClick(doc)}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <FileText className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Star className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">{doc.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{doc.category}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {doc.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {doc.permissions.length}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {doc.lastModified}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {doc.views}
                  </span>
                  <span className="flex items-center">
                    <Download className="h-3 w-3 mr-1" />
                    {doc.downloads}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {doc.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => onDocumentClick(doc)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">{doc.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {doc.category} • {doc.author} • {doc.lastModified}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {doc.permissions.length}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {doc.views}
                      </span>
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {doc.downloads}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {doc.comments}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <Star className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView; 