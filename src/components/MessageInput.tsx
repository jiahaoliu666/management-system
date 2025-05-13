import React from 'react';

export default function MessageInput() {
  return (
    <div className="w-full bg-gray-900 px-6 py-3 border-t border-gray-800 flex items-center">
      <input
        type="text"
        placeholder="輸入訊息..."
        className="flex-1 bg-gray-800 text-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">送出</button>
    </div>
  );
} 