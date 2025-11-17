import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../lib/api.jsx';

export default function ForumThreadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api(`/forums/${id}`);
        if (!cancelled) setThread(data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load thread');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, reloadKey]);

  const authorName = useMemo(() => {
    if (!thread?.author) return 'Anonymous';
    return thread.author.name || thread.author.email?.split('@')[0] || 'Anonymous';
  }, [thread]);
  const authorHandle = thread?.author?.username ? `@${thread.author.username}` : '';

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await api(`/forums/${id}/comments`, {
        method: 'POST',
        body: { body: comment.trim() },
      });
      setComment('');
      // Reload thread to show new comment
      const data = await api(`/forums/${id}`);
      setThread(data);
    } catch (e) {
      alert('Failed to post comment.');
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  const isAdmin = user?.publicMetadata?.role === 'admin';
  const canDeleteThread = useMemo(() => {
    if (!thread?.author?.id) return false;
    // Support admin override, dev bypass user id and Clerk user id
    return isAdmin || thread.author.id === 'dev-user' || thread.author.id === user?.id;
  }, [thread, user, isAdmin]);

  const handleDeleteThread = async () => {
    if (!canDeleteThread) return;
    if (!confirm('Delete this thread? This cannot be undone.')) return;
    try {
      await api(`/forums/${id}`, { method: 'DELETE' });
      navigate('/forums');
    } catch (e) {
      alert('Failed to delete thread');
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="h-8 w-48 bg-slate-200 rounded mb-4 animate-pulse"></div>
          <div className="h-6 w-80 bg-slate-200 rounded mb-2 animate-pulse"></div>
          <div className="h-40 w-full bg-slate-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
          <button className="text-blue-600 font-semibold mb-4" onClick={() => navigate(-1)}>← Back</button>
          <div className="bg-white border border-slate-200 rounded p-6">
            <div className="text-red-600 font-bold mb-2">Failed to load thread</div>
            <div className="text-slate-700">{error}</div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded" onClick={() => setReloadKey(k => k + 1)}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!thread) return null;

  const badge = (cat) => {
    const map = {
      study: { icon: '✏️', label: 'Study Tips' },
      tech: { icon: '💻', label: 'Tech Help' },
      career: { icon: '🎯', label: 'Career' },
      general: { icon: '💬', label: 'General' },
    };
    return map[cat] || map.general;
  };

  const b = badge(thread.category || 'general');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button className="text-blue-600 font-semibold" onClick={() => navigate(-1)}>← Back</button>
          <div className="flex items-center gap-3">
            {canDeleteThread && (
              <button onClick={handleDeleteThread} className="px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200">Delete Thread</button>
            )}
            <Link className="text-slate-600 hover:text-slate-800 font-semibold" to="/forums">All Threads</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-bold">
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
            <div className="text-xs text-slate-500 font-semibold">{new Date(thread.createdAt).toLocaleString()}</div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">{thread.title}</h1>
          <div className="text-sm text-slate-600 font-semibold mb-4">by {authorName} {authorHandle && <span className="text-slate-500 font-normal">{authorHandle}</span>}</div>
          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{thread.body}</p>

          <div className="flex items-center gap-6 pt-4 mt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-600 text-sm"><span>💬</span><span className="font-semibold">{thread.replies || thread.comments?.length || 0}</span><span>replies</span></div>
            <div className="flex items-center gap-2 text-slate-600 text-sm"><span>👁️</span><span className="font-semibold">{thread.views || 0}</span><span>views</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Comments</h2>
          {thread.comments && thread.comments.length > 0 ? (
            <div className="space-y-4">
              {thread.comments.map((c) => {
                const canDeleteComment = isAdmin || (c.author?.id === 'dev-user') || (c.author?.id && c.author.id === user?.id);
                const onDelete = async () => {
                  if (!canDeleteComment) return;
                  if (!confirm('Delete this comment?')) return;
                  // optimistic remove
                  const prev = thread;
                  setThread(t => ({ ...t, comments: t.comments.filter(x => x.id !== c.id) }));
                  try {
                    await api(`/forums/${id}/comments/${c.id}`, { method: 'DELETE' });
                  } catch (e) {
                    // revert
                    setThread(prev);
                    alert('Failed to delete comment');
                    console.error(e);
                  }
                };
                return (
                  <div key={c.id} className="border border-slate-200 rounded p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-slate-600 font-semibold">
                        {(c.author?.name || c.author?.email?.split('@')[0] || 'Anonymous')} {c.author?.username ? <span className="text-slate-500 font-normal">@{c.author.username}</span> : null} • {new Date(c.createdAt).toLocaleString()}
                      </div>
                      {canDeleteComment && (
                        <button onClick={onDelete} className="text-red-600 hover:text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-50">Delete</button>
                      )}
                    </div>
                    <div className="text-slate-800 whitespace-pre-wrap">{c.body}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-600">No comments yet.</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-900 mb-3">Add a comment</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full min-h-[100px] px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all mb-3 text-slate-800"
            maxLength={1000}
          />
          <div className="flex justify-end">
            <button
              onClick={handlePostComment}
              disabled={!comment.trim() || posting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
