import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-2 min-h-screen">
      {/* 伺服器圖示範例 */}
      <button className="w-12 h-12 bg-gray-800 rounded-2xl hover:bg-indigo-600 transition" />
      <button className="w-12 h-12 bg-gray-800 rounded-2xl hover:bg-green-600 transition" />
      <button className="w-12 h-12 bg-gray-800 rounded-2xl hover:bg-yellow-600 transition" />
      {/* ...可依需求增加更多圖示 */}
    </aside>
  );
} 