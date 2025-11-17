import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatPane from '../ai/ChatPane.jsx';

export default function AiBuddyButton() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Don't show on these pages
  const hiddenPages = ['/login', '/register', '/'];
  const shouldHide = hiddenPages.includes(location.pathname);
  
  if (shouldHide) return null;
  
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 group w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-full hover:scale-110 active:scale-95 transition-all duration-200 shadow-2xl hover:shadow-purple-500/50 z-[9998] flex items-center justify-center"
        title="Ask AI Buddy"
        aria-label="Open AI Buddy chat"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"></div>
        <span className="text-3xl relative z-10">🤖</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 max-w-[calc(100vw-32px)] h-[600px] max-h-[80vh] z-[9999] rounded-xl shadow-2xl overflow-hidden">
          <ChatPane onClose={() => setIsOpen(false)} isModal={true} />
        </div>
      )}
    </>
  );
}
