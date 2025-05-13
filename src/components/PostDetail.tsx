import React from 'react';

export default function PostDetail() {
  return (
    <div className="w-96 bg-gray-800 p-4 border-l border-gray-700 min-h-screen">
      <div className="font-bold text-xl text-white mb-2">MINIO SOP</div>
      <div className="text-gray-400 text-sm mb-4">Bob · 2025/5/11 上午8:51</div>
      <div className="mb-4">
        <div className="font-semibold text-gray-300">目錄：</div>
        <ul className="list-disc list-inside text-gray-200">
          <li>一般情況操作步驟</li>
          <li>緊急情況操作步驟</li>
          <li>PM 及技術單位聯絡資訊</li>
        </ul>
      </div>
      <div className="font-semibold text-gray-300 mb-1">相關連結：</div>
      <ul className="list-disc list-inside text-blue-400">
        <li><a href="#" className="hover:underline">原 SOP</a></li>
        <li><a href="#" className="hover:underline">ITop</a></li>
        <li><a href="#" className="hover:underline">Subnet 叢入頁面</a></li>
      </ul>
      <div className="mt-4 text-gray-400">MINIO 帳號密碼待補箱</div>
    </div>
  );
} 