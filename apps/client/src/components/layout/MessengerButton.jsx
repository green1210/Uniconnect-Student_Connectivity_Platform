import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function MessengerButton() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Only show on Feed page
  const shouldShow = location.pathname === '/feed';
  
  if (!shouldShow) return null;
  
  return (
    <>
      {/* Floating Messenger Button - Positioned above AI Buddy */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-8 group w-16 h-16 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 text-white rounded-full hover:scale-110 active:scale-95 transition-all duration-200 shadow-2xl hover:shadow-pink-500/50 z-[9998] flex items-center justify-center"
        title="Open Messenger"
        aria-label="Open messenger"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"></div>
        <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.15 2 11.25c0 2.92 1.44 5.51 3.69 7.24V22l3.41-1.87c.91.25 1.87.37 2.9.37 5.52 0 10-4.15 10-9.25S17.52 2 12 2zm1 12.5h-2v-2h2v2zm0-3.5h-2V7h2v4z"/>
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Messenger Modal */}
      {isOpen && (
        <div className="fixed bottom-48 right-8 w-96 max-w-[calc(100vw-32px)] h-[600px] max-h-[80vh] z-[9999] rounded-xl shadow-2xl overflow-hidden bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.15 2 11.25c0 2.92 1.44 5.51 3.69 7.24V22l3.41-1.87c.91.25 1.87.37 2.9.37 5.52 0 10-4.15 10-9.25S17.52 2 12 2zm1 12.5h-2v-2h2v2zm0-3.5h-2V7h2v4z"/>
              </svg>
              <h3 className="font-bold text-lg">Messenger</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-128px)] bg-slate-50">
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm">Start chatting with your peers!</p>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full border border-slate-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
              <button className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
