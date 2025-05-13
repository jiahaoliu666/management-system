import React from 'react';

export default function PostList() {
  return (
    <div className="flex-1 bg-gray-700 p-4 overflow-y-auto min-h-screen">
      {/* 貼文列表範例 */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow hover:shadow-lg transition">
        <div className="font-bold text-lg text-white">MINIO SOP</div>
        <div className="text-gray-400 text-sm">Bob · 3 天以前</div>
        <div className="text-gray-200 mt-2">一般情況操作步驟、緊急情況操作步驟、PM 及技術單位聯絡資訊</div>
      </div>
      {/* ...可依需求增加更多貼文 */}
    </div>
  );
} 