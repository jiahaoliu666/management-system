import React from 'react';

export default function ChannelList() {
  return (
    <nav className="w-64 bg-gray-800 p-4 flex flex-col min-h-screen">
      <div className="font-bold text-gray-300 mb-2">其他產品線</div>
      {/* 頻道項目範例 */}
      <button className="text-left py-2 px-3 rounded hover:bg-gray-700 text-gray-200">MINIO SOP</button>
      <button className="text-left py-2 px-3 rounded hover:bg-gray-700 text-gray-200">奧義智慧 SOP</button>
      <button className="text-left py-2 px-3 rounded hover:bg-gray-700 text-gray-200">Dell Server/Storage SOP</button>
      <button className="text-left py-2 px-3 rounded hover:bg-gray-700 text-gray-200">PureStorage SOP</button>
      <button className="text-left py-2 px-3 rounded hover:bg-gray-700 text-gray-200">Akamai SOP</button>
      {/* ...可依需求增加更多頻道 */}
    </nav>
  );
} 