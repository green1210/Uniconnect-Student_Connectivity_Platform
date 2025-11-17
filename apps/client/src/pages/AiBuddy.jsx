import React from 'react';
import ChatPane from '../components/ai/ChatPane.jsx';

export default function AiBuddy() {
  return (
    <main id="main-content" className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto h-full">
        <ChatPane />
      </div>
    </main>
  );
}
