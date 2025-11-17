import React, { useState, useRef, useEffect } from 'react';

export default function Messenger({ isOpen, onClose, conversations, activeConversation, onSelectConversation }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load messages for active conversation
    if (activeConversation) {
      setMessages(activeConversation.messages || []);
    }
  }, [activeConversation]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'me',
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto animate-fadeIn">
      {/* Mobile overlay */}
      <div className="md:hidden fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      
      {/* Messenger container */}
      <div className="fixed md:relative bottom-0 right-0 md:bottom-auto md:right-auto w-full md:w-96 h-[80vh] md:h-[600px] bg-white rounded-t-3xl md:rounded-2xl shadow-2xl md:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.3)] flex flex-col z-50 transform md:animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 animate-pulse-slow"></div>
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-white/20 rounded-full transition-all text-white"
              aria-label="Close messenger"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {activeConversation ? (
              <>
                <div className="relative">
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
                  />
                  {activeConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{activeConversation.name}</h3>
                  <p className="text-xs text-white/90 font-medium">
                    {activeConversation.online ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="font-bold text-white text-lg">Messages</h3>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="hidden md:block p-2 hover:bg-white/20 rounded-full transition-all text-white relative z-10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!activeConversation ? (
          /* Conversations List */
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 border-b border-slate-100 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-0 group-hover:opacity-50 transform -translate-x-full group-hover:translate-x-0 transition-all duration-300"></div>
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">{conv.name}</h4>
                    <span className="text-xs text-slate-500">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="min-w-[20px] h-5 px-1.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce relative z-10">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      msg.sender === 'me'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-end gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm"
                  rows={1}
                  style={{ maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
