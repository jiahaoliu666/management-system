import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChannelList from '../components/ChannelList';
import Topbar from '../components/Topbar';
import PostList from '../components/PostList';
import PostDetail from '../components/PostDetail';
import MessageInput from '../components/MessageInput';

export default function Home() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <ChannelList />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <div className="flex flex-1 min-h-0">
          <PostList
            selectedPostId={selectedPostId}
            onSelect={(id: string) => setSelectedPostId(prev => prev === id ? null : id)}
          />
          {selectedPostId && (
            <PostDetail postId={selectedPostId} />
          )}
        </div>
        <MessageInput />
      </div>
    </div>
  );
}
