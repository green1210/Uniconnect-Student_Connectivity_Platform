import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '../components/profile/ProfileContext.jsx';
import FeedItem from '../components/feed/FeedItem.jsx';
import { api } from '../lib/api.jsx';

export default function Feed() {
  const { user } = useUser();
  const { profile } = useProfile();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  // User search functionality
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const results = await api(`/profile/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(results || []);
      } catch (error) {
        console.error('[USER_SEARCH_ERROR]', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await api('/feed');
      setPosts(data || []);
    } catch (error) {
      console.error('[FEED_LOAD_ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if ((!newPost.trim() && !selectedMedia) || posting) return;

    setPosting(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if selected
      if (selectedMedia) {
        setUploadingMedia(true);
        const formData = new FormData();
        formData.append('media', selectedMedia);

        const token = localStorage.getItem('auth_token');
        const uploadResponse = await fetch('/api/feed/upload-media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload media');
        }

        const uploadData = await uploadResponse.json();
        mediaUrl = uploadData.mediaUrl;
        mediaType = uploadData.mediaType;
        setUploadingMedia(false);
      }

      const post = await api('/feed', {
        method: 'POST',
        body: JSON.stringify({ 
          content: newPost.trim() || 'Shared a media file',
          mediaUrl,
          mediaType
        })
      });
      setPosts([post, ...posts]);
      setNewPost('');
      setSelectedMedia(null);
      setMediaPreview(null);
    } catch (error) {
      console.error('[POST_CREATE_ERROR]', error);
      alert('Failed to create post: ' + error.message);
    } finally {
      setPosting(false);
      setUploadingMedia(false);
    }
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    setSelectedMedia(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;

    try {
      await api(`/feed/${postId}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('[POST_DELETE_ERROR]', error);
      alert('Failed to delete post');
    }
  };

  const handleEditPost = async (postId, newContent) => {
    try {
      const updatedPost = await api(`/feed/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: newContent })
      });
      
      setPosts(posts.map(p => p.id === postId ? updatedPost : p));
    } catch (error) {
      console.error('[POST_EDIT_ERROR]', error);
      throw error;
    }
  };

  const handleSendSync = async (targetUserId) => {
    try {
      await api('/sync/request', {
        method: 'POST',
        body: JSON.stringify({ receiverId: targetUserId })
      });
      alert('Sync request sent!');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('[SYNC_REQUEST_ERROR]', error);
      alert('Failed to send sync request');
    }
  };

  const handleMessage = (targetUserId) => {
    // Navigate to messenger with this user
    window.location.href = `/messenger?user=${targetUserId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Feed</h1>
          <p className="text-slate-600">Share updates and connect with students</p>
        </div>

        {/* User Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for users..."
              className="flex-1 outline-none text-slate-900 placeholder-slate-400"
            />
            {searching && (
              <div className="text-xs text-slate-500">Searching...</div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg z-50 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <div key={result.id} className="p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.avatar ? (
                        <img src={result.avatar} alt={result.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {result.name?.[0] || result.email?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{result.name || result.email}</div>
                        {result.profile?.university && (
                          <div className="text-xs text-slate-500">{result.profile.university}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMessage(result.id)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Message
                      </button>
                      <button
                        onClick={() => handleSendSync(result.id)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
                      >
                        Sync
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex gap-4">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile?.name || 'Profile'}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {profile?.name?.[0] || user?.firstName?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share something with your peers..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                rows="3"
              />
              
              {/* Media Preview */}
              {mediaPreview && (
                <div className="mt-3 relative">
                  <button
                    onClick={handleRemoveMedia}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                    title="Remove media"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {selectedMedia?.type.startsWith('video/') ? (
                    <video src={mediaPreview} controls className="w-full max-h-96 rounded-lg border border-slate-200" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full max-h-96 object-cover rounded-lg border border-slate-200" />
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3">
                {/* Media Upload Buttons */}
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMediaSelect}
                      className="hidden"
                    />
                  </label>
                  
                  <label className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleMediaSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <button
                  onClick={handleCreatePost}
                  disabled={(!newPost.trim() && !selectedMedia) || posting || uploadingMedia}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingMedia ? 'Uploading...' : posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Loading feed...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-slate-600 font-semibold mb-2">No posts yet</div>
            <div className="text-slate-500 text-sm">Be the first to share something!</div>
          </div>
        ) : (
          <div className="max-w-[470px] mx-auto space-y-6">
            {posts.map((post) => (
              <FeedItem
                key={post.id}
                id={post.id}
                authorName={post.author?.name}
                authorUsername={post.author?.username}
                authorId={post.author?.id}
                authorAvatar={post.author?.avatar}
                content={post.content}
                time={post.createdAt}
                mediaUrl={post.mediaUrl}
                mediaType={post.mediaType}
                canDelete={post.authorId === profile?.id}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
