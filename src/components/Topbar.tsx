import React from 'react';

export default function Topbar() {
  return (
    <header className="w-full h-14 bg-gray-900 flex items-center px-6 border-b border-gray-800 justify-between">
      <div className="text-white font-bold text-lg">MINIO SOP</div>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="搜尋..."
          className="bg-gray-800 text-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold">B</div>
      </div>
    </header>
  );
} 