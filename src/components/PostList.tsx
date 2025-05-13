import React from 'react';

type Post = {
  id: string;
  title: string;
  author: string;
  time: string;
  summary: string;
};

type PostListProps = {
  selectedPostId: string | null;
  onSelect: (id: string) => void;
};

const posts: Post[] = [
  { id: '1', title: 'MINIO SOP', author: 'Bob', time: '3 天以前', summary: '一般情況操作步驟、緊急情況操作步驟、PM 及技術單位聯絡資訊' },
  // ...其他貼文
];

export default function PostList({ selectedPostId, onSelect }: PostListProps) {
  return (
    <div className="flex-1 bg-gray-700 p-4 overflow-y-auto min-h-screen">
      {posts.map(post => (
        <div
          key={post.id}
          className={`bg-gray-800 rounded-lg p-4 mb-4 shadow transition cursor-pointer
            ${selectedPostId === post.id ? 'ring-2 ring-indigo-500' : 'hover:shadow-lg'}`}
          onClick={() => onSelect(post.id)}
        >
          <div className="font-bold text-lg text-white">{post.title}</div>
          <div className="text-gray-400 text-sm">{post.author} · {post.time}</div>
          <div className="text-gray-200 mt-2">{post.summary}</div>
        </div>
      ))}
    </div>
  );
} 