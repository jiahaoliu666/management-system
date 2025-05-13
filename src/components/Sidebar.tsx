// src/components/Sidebar.tsx
import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-20 bg-gray-900 flex flex-col items-center py-4 space-y-3 min-h-screen">
      {/* 伺服器圖示 */}
      <button className="w-12 h-12 bg-indigo-600 rounded-3xl hover:rounded-2xl hover:bg-indigo-400 transition-all duration-200 shadow-lg border-4 border-gray-900" />
      <button className="w-12 h-12 bg-green-600 rounded-3xl hover:rounded-2xl hover:bg-green-400 transition-all duration-200 shadow-lg border-4 border-gray-900" />
      <button className="w-12 h-12 bg-yellow-500 rounded-3xl hover:rounded-2xl hover:bg-yellow-300 transition-all duration-200 shadow-lg border-4 border-gray-900" />
      {/* ...可依需求增加更多圖示 */}
      <div className="flex-1" />
      {/* 用戶頭像 */}
      <div className="w-10 h-10 bg-gray-700 rounded-full mt-4 border-2 border-gray-800" />
    </aside>
  );
}