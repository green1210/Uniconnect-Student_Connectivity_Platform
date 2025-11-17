import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../lib/api.jsx';

export default function ChatPane({ onClose, isModal = false }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const send = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || loading) return;
    
    const userMsg = { 
      role: 'user', 
      content: trimmedText, 
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(m => [...m, userMsg]);
    setText('');
    setLoading(true);
    setIsTyping(true);
    setError(null);
    
    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const data = await api('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: userMsg.content,
          conversationHistory
        })
      });
      
      console.log('[ChatPane] ✅ Success! Source:', data.source || 'unknown');
      
      if (!data || !data.reply || !data.reply.trim()) {
        console.error('[ChatPane] Empty reply:', data);
        throw new Error('AI returned an empty response');
      }
      
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages(m => [...m, { 
        role: 'ai', 
        content: data.reply.trim(),
        id: Date.now() + 1,
        timestamp: new Date().toISOString(),
        source: data.source
      }]);
    } catch (e) {
      const errorMsg = e.message || 'Something went wrong';
      console.error('[ChatPane] ❌ Error:', errorMsg);
      setError(errorMsg);
      
      setMessages(m => [...m, { 
        role: 'ai', 
        content: `😓 Oops! ${errorMsg}\n\nPlease try again or rephrase your question.`, 
        id: Date.now() + 1, 
        timestamp: new Date().toISOString(),
        isError: true 
      }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const suggestedQuestions = [
    '📚 What are the best study techniques for exams?',
    '🎯 How can I stay motivated while studying?',
    '🧠 Explain the Pomodoro Technique',
    '💡 Give me tips for managing my time better',
    '✍️ How do I take effective notes?',
    '🔍 Help me understand active recall'
  ];

  const containerClass = isModal 
    ? 'flex flex-col h-full bg-white rounded-xl overflow-hidden'
    : 'flex flex-col h-screen md:h-auto md:rounded-xl bg-white md:shadow-lg overflow-hidden';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
              🤖
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">AI Buddy</h1>
              <p className="text-blue-100 text-xs md:text-sm">Your learning assistant</p>
            </div>
          </div>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl mb-4 shadow-lg animate-bounce" style={{ animationDuration: '2s', animationIterationCount: '3' }}>
              🤖
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Hi! I'm your AI Study Buddy</h2>
            <p className="text-slate-600 mb-8 max-w-md text-sm md:text-base">
              I'm here to help you learn better! Ask me about study techniques, concepts, time management, or anything academic.
            </p>
            {!isModal && (
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-semibold mb-3">Try asking:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setText(q); }}
                      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all text-left text-xs md:text-sm font-medium text-slate-700 hover:text-blue-700 group"
                    >
                      <span className="group-hover:translate-x-1 inline-block transition-transform">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-md`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm transition-all text-sm md:text-base ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                        : `${msg.isError ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-white text-slate-900 border border-slate-200'} rounded-bl-sm`
                    }`}
                  >
                    <p className={`leading-relaxed ${msg.role === 'ai' ? 'whitespace-pre-wrap' : ''}`}>
                      {msg.content}
                    </p>
                  </div>
                  {msg.timestamp && (
                    <span className="text-xs text-slate-400 mt-1 px-2">
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {(loading || isTyping) && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white text-slate-900 border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-slate-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 md:mx-6 mt-2 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs md:text-sm text-red-700">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3 md:p-4">
        <div className="flex gap-2 md:gap-3">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about studying..."
              disabled={loading}
              rows={isModal ? "2" : "2"}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 text-sm md:text-base placeholder:text-slate-400"
            />
            {text.length > 0 && (
              <span className="absolute bottom-2 right-2 text-xs text-slate-400">
                {text.length}/500
              </span>
            )}
          </div>
          <button
            onClick={send}
            disabled={loading || !text.trim()}
            className={`px-5 py-3 rounded-xl font-semibold transition-all self-end shadow-md text-sm md:text-base min-w-[60px] md:min-w-[70px] ${
              loading || !text.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
            title="Send message (Enter)"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            )}
          </button>
        </div>
        {!isModal && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs text-slate-500">💡 Press</span>
            <kbd className="px-2 py-0.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded">Enter</kbd>
            <span className="text-xs text-slate-500">to send</span>
          </div>
        )}
      </div>
    </div>
  );
}
