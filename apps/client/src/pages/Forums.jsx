import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import ForumThreadItem from '../components/forums/ForumThreadItem.jsx';
import { api } from '../lib/api.jsx';

export default function Forums() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', body: '', category: 'general' });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await api('/forums');
      setThreads(data || []);
    } catch (error) {
      console.error('[FORUMS_LOAD_ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.body.trim() || posting) return;

    setPosting(true);
    try {
      const thread = await api('/forums', {
        method: 'POST',
        body: JSON.stringify(newThread)
      });
      setThreads([thread, ...threads]);
      setNewThread({ title: '', body: '', category: 'general' });
      setShowNewThreadModal(false);
    } catch (error) {
      console.error('[THREAD_CREATE_ERROR]', error);
      alert('Failed to create thread');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Forums</h1>
            <p className="text-slate-600">Ask questions and share knowledge</p>
          </div>
          <button
            onClick={() => setShowNewThreadModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            + New Thread
          </button>
        </div>

        {/* New Thread Modal */}
        {showNewThreadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Create New Thread</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    placeholder="What's your question?"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    value={newThread.category}
                    onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="general">💬 General</option>
                    <option value="study">✏️ Study Tips</option>
                    <option value="tech">💻 Tech Help</option>
                    <option value="career">🎯 Career</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Body</label>
                  <textarea
                    value={newThread.body}
                    onChange={(e) => setNewThread({ ...newThread, body: e.target.value })}
                    placeholder="Provide more details..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    rows="6"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowNewThreadModal(false);
                    setNewThread({ title: '', body: '', category: 'general' });
                  }}
                  className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateThread}
                  disabled={!newThread.title.trim() || !newThread.body.trim() || posting}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? 'Posting...' : 'Create Thread'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Threads List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Loading forums...</div>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="text-6xl mb-4">💬</div>
            <div className="text-slate-600 font-semibold mb-2">No threads yet</div>
            <div className="text-slate-500 text-sm">Be the first to start a discussion!</div>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <ForumThreadItem
                key={thread.id}
                id={thread.id}
                title={thread.title}
                body={thread.body}
                authorName={thread.author?.name || thread.author?.email?.split('@')[0]}
                authorUsername={thread.author?.username}
                authorId={thread.author?.id}
                replies={thread._count?.comments || 0}
                views={thread.views || 0}
                createdAt={thread.createdAt}
                category={thread.category || 'general'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
