import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '../components/profile/ProfileContext.jsx';
import FeedItem from '../components/feed/FeedItem.jsx';
import { api, getMediaUrl } from '../lib/api.jsx';

export default function Profile() {
  const { user } = useUser();
  const { profile, loading, error } = useProfile();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    username: '',
    bio: '',
    university: '',
    major: '',
    year: ''
  });
  const [saving, setSaving] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [userThreads, setUserThreads] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [userMaterials, setUserMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'forums', 'projects', 'materials'
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.profile?.bio || '',
        university: profile.profile?.university || '',
        major: profile.profile?.major || '',
        year: profile.profile?.year || ''
      });
      loadUserPosts();
      loadUserContent();
    }
  }, [profile]);

  const loadUserContent = async () => {
    if (!profile?.id) {
      console.log('[LOAD_CONTENT] No profile ID available');
      return;
    }
    
    console.log('[LOAD_CONTENT] Loading content for profile:', profile.id);
    
    try {
      setLoadingPosts(true);
      
      // Load posts
      const allPosts = await api('/feed');
      console.log('[LOAD_POSTS] Total posts:', allPosts.length);
      const myPosts = allPosts.filter(p => p.authorId === profile.id);
      console.log('[LOAD_POSTS] My posts:', myPosts.length, myPosts);
      setUserPosts(myPosts);
      
      // Load forums (threads)
      try {
        const allThreads = await api('/forums');
        console.log('[LOAD_THREADS] Total threads:', allThreads.length);
        const myThreads = allThreads.filter(t => t.authorId === profile.id);
        console.log('[LOAD_THREADS] My threads:', myThreads.length, myThreads);
        setUserThreads(myThreads);
      } catch (err) {
        console.error('[LOAD_THREADS_ERROR]', err);
      }
      
      // Load projects
      try {
        const allProjects = await api('/projects');
        console.log('[LOAD_PROJECTS] Total projects:', allProjects.length);
        console.log('[LOAD_PROJECTS] All projects:', allProjects);
        const myProjects = allProjects.filter(p => p.ownerId === profile.id);
        console.log('[LOAD_PROJECTS] My projects:', myProjects.length, myProjects);
        setUserProjects(myProjects);
      } catch (err) {
        console.error('[LOAD_PROJECTS_ERROR]', err);
      }
      
      // Load materials
      try {
        const allMaterials = await api('/materials');
        console.log('[LOAD_MATERIALS] Total materials:', allMaterials.length);
        const myMaterials = allMaterials.filter(m => m.uploaderId === profile.id);
        console.log('[LOAD_MATERIALS] My materials:', myMaterials.length, myMaterials);
        setUserMaterials(myMaterials);
      } catch (err) {
        console.error('[LOAD_MATERIALS_ERROR]', err);
      }
    } catch (error) {
      console.error('[PROFILE_CONTENT_ERROR]', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadUserPosts = async () => {
    // Legacy function - now handled by loadUserContent
    return;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api('/profile', {
        method: 'PUT',
        body: JSON.stringify(editData)
      });
      // Manually update profile since we're not using updateProfile from context
      window.location.reload(); // Simple refresh to get updated data
      setEditing(false);
    } catch (error) {
      console.error('[PROFILE_UPDATE_ERROR]', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      window.location.reload();
    } catch (error) {
      console.error('[AVATAR_UPLOAD_ERROR]', error);
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('banner', file);

    try {
      setUploadingBanner(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile/upload-banner', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      window.location.reload();
    } catch (error) {
      console.error('[BANNER_UPLOAD_ERROR]', error);
      alert('Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;

    try {
      await api(`/feed/${postId}`, { method: 'DELETE' });
      setUserPosts(userPosts.filter(p => p.id !== postId));
      setShowPostModal(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('[POST_DELETE_ERROR]', error);
      alert('Failed to delete post');
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleCloseModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-2">Error loading profile</div>
          <div className="text-slate-600 text-sm">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-slate-600">No profile data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Post Modal */}
      {showPostModal && selectedPost && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Side - Media */}
            {selectedPost.mediaUrl && (
              <div className="flex-1 bg-black flex items-center justify-center">
                {selectedPost.mediaType === 'video' ? (
                  <video 
                    src={selectedPost.mediaUrl} 
                    controls 
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                ) : (
                  <img 
                    src={selectedPost.mediaUrl} 
                    alt="Post" 
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                )}
              </div>
            )}
            
            {/* Right Side - Details */}
            <div className={`${selectedPost.mediaUrl ? 'w-96' : 'flex-1'} flex flex-col`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {profile.avatar ? (
                    <img 
                      src={getMediaUrl(profile.avatar)} 
                      alt={profile.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {profile.name?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{profile.name}</div>
                    {profile.username && (
                      <div className="text-sm text-slate-500">@{profile.username}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedPost.content && (
                  <div className="mb-4">
                    <span className="text-slate-900">{selectedPost.content}</span>
                  </div>
                )}
                
                {/* Timestamp */}
                <div className="text-xs text-slate-400 uppercase mt-4">
                  {new Date(selectedPost.createdAt).toLocaleString()}
                </div>
              </div>
              
              {/* Actions */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex items-center gap-4 mb-4">
                  <button className="hover:opacity-50 transition-opacity">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="hover:opacity-50 transition-opacity">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button className="hover:opacity-50 transition-opacity">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeletePost(selectedPost.id)}
                    className="ml-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Banner */}
      <div className="relative">
        {/* Banner */}
        <div className="h-80 relative overflow-hidden group">
          {profile.profile?.banner ? (
            <img src={getMediaUrl(profile.profile.banner)} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
          )}
          
          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50" />
          
          {editing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
              <div className="text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-lg font-bold">{uploadingBanner ? 'Uploading...' : 'Change Cover Photo'}</span>
              </div>
              <input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploadingBanner} className="hidden" />
            </label>
          )}
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto px-6">
          {/* Avatar and Quick Actions */}
          <div className="relative flex items-end gap-8 -mt-32 mb-8">
            {/* Avatar with ring */}
            <div className="relative group">
              <div className="relative">
                {profile.avatar ? (
                  <img 
                    src={getMediaUrl(profile.avatar)} 
                    alt={profile.name} 
                    className="w-48 h-48 rounded-3xl border-8 border-white shadow-2xl object-cover bg-white"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-3xl border-8 border-white shadow-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-6xl font-black text-white">
                      {profile.name?.[0] || user?.firstName?.[0] || 'U'}
                    </span>
                  </div>
                )}
                
                {/* Online status indicator */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-green-500 border-4 border-white rounded-full" />
              </div>
              
              {editing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="text-white text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-bold">{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
                </label>
              )}
            </div>

            {/* Name and Edit Button */}
            <div className="flex-1 flex items-end justify-between pb-6">
              <div>
                <h1 className="text-5xl font-black text-slate-900 mb-2 leading-tight">
                  {profile.name || user?.fullName || 'User'}
                </h1>
                {profile.username && (
                  <p className="text-xl text-slate-500 font-medium">@{profile.username}</p>
                )}
              </div>
              
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : editing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{userPosts.length}</div>
                  <div className="text-sm font-medium text-slate-500">Posts Shared</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">0</div>
                  <div className="text-sm font-medium text-slate-500">Connections</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">0</div>
                  <div className="text-sm font-medium text-slate-500">Study Materials</div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
              About
            </h2>

                {editing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">@</span>
                          <input
                            type="text"
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                            placeholder="username"
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none transition-all"
                        rows="4"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="text-xs text-slate-400 mt-2">{editData.bio.length}/500 characters</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">University</label>
                        <input
                          type="text"
                          value={editData.university}
                          onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          placeholder="e.g., MIT"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Major</label>
                        <input
                          type="text"
                          value={editData.major}
                          onChange={(e) => setEditData({ ...editData, major: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Academic Year</label>
                        <select
                          value={editData.year}
                          onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        >
                          <option value="">Select year</option>
                          <option value="Freshman">Freshman</option>
                          <option value="Sophomore">Sophomore</option>
                          <option value="Junior">Junior</option>
                          <option value="Senior">Senior</option>
                          <option value="Graduate">Graduate</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg"
                      >
                        {saving ? 'Saving Changes...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Bio */}
                    {editData.bio ? (
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</div>
                        <p className="text-slate-700 leading-relaxed text-lg">{editData.bio}</p>
                      </div>
                    ) : (
                      <div className="text-slate-400 italic">No bio added yet. Click Edit Profile to add one.</div>
                    )}
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">University</div>
                          <div className="text-slate-900 font-semibold text-lg">{editData.university || 'Not specified'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Major</div>
                          <div className="text-slate-900 font-semibold text-lg">{editData.major || 'Not specified'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Year</div>
                          <div className="text-slate-900 font-semibold text-lg">{editData.year || 'Not specified'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</div>
                          <div className="text-slate-900 font-semibold text-lg break-all">{profile.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
          </div>

          {/* Content Tabs - Instagram Style */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === 'posts'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>Posts</span>
                  <span className="text-xs">({userPosts.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('forums')}
                className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === 'forums'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <span>Forums</span>
                  <span className="text-xs">({userThreads.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === 'projects'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Projects</span>
                  <span className="text-xs">({userProjects.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex-1 py-4 px-6 font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === 'materials'
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Materials</span>
                  <span className="text-xs">({userMaterials.length})</span>
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loadingPosts ? (
                <div className="text-center py-16">
                  <svg className="animate-spin w-12 h-12 mx-auto mb-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <div className="text-slate-500 font-medium">Loading content...</div>
                </div>
              ) : (
                <>
                  {/* Posts Grid */}
                  {activeTab === 'posts' && (
                    userPosts.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <div className="text-8xl mb-6">📝</div>
                        <div className="text-xl font-bold text-slate-900 mb-2">No posts yet</div>
                        <div className="text-slate-500 mb-6">Start sharing your thoughts and connect with others!</div>
                        <a 
                          href="/feed" 
                          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                          Create Your First Post
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1">
                        {userPosts.map((post) => (
                          <div 
                            key={post.id} 
                            onClick={() => handlePostClick(post)}
                            className="aspect-square relative group cursor-pointer bg-slate-100 overflow-hidden"
                          >
                            {post.mediaUrl ? (
                              <>
                                {post.mediaType === 'video' ? (
                                  <video 
                                    src={post.mediaUrl} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img 
                                    src={post.mediaUrl} 
                                    alt="Post" 
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center p-4">
                                <p className="text-slate-600 text-sm line-clamp-6 text-center">{post.content}</p>
                              </div>
                            )}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="flex items-center justify-center gap-6">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                    <span className="font-bold">0</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                                      <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
                                    </svg>
                                    <span className="font-bold">0</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* Forums Grid */}
                  {activeTab === 'forums' && (
                    userThreads.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <div className="text-8xl mb-6">💬</div>
                        <div className="text-xl font-bold text-slate-900 mb-2">No forum posts yet</div>
                        <div className="text-slate-500 mb-6">Start discussions and ask questions!</div>
                        <a 
                          href="/forums" 
                          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                          Create Forum Post
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {userThreads.map((thread) => (
                          <div 
                            key={thread.id} 
                            className="p-6 border border-slate-200 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                          >
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{thread.title}</h3>
                            <p className="text-slate-600 text-sm line-clamp-2 mb-3">{thread.content}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {thread._count?.comments || 0} replies
                              </span>
                              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* Projects Grid */}
                  {activeTab === 'projects' && (
                    userProjects.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <div className="text-8xl mb-6">🚀</div>
                        <div className="text-xl font-bold text-slate-900 mb-2">No projects yet</div>
                        <div className="text-slate-500 mb-6">Showcase your amazing projects!</div>
                        <a 
                          href="/projects" 
                          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                          Add Project
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {userProjects.map((project) => (
                          <div 
                            key={project.id} 
                            className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                          >
                            {project.coverImage ? (
                              <img 
                                src={project.coverImage} 
                                alt={project.name} 
                                className="w-full h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-6xl">🚀</span>
                              </div>
                            )}
                            <div className="p-4">
                              <h3 className="text-lg font-bold text-slate-900 mb-2">{project.name}</h3>
                              <p className="text-slate-600 text-sm line-clamp-2 mb-3">{project.summary || project.description}</p>
                              {project.tags && (
                                <div className="flex flex-wrap gap-2">
                                  {project.tags.split(',').slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg">
                                      {tag.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* Materials Grid */}
                  {activeTab === 'materials' && (
                    userMaterials.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <div className="text-8xl mb-6">📚</div>
                        <div className="text-xl font-bold text-slate-900 mb-2">No study materials yet</div>
                        <div className="text-slate-500 mb-6">Share notes, PDFs, and resources!</div>
                        <a 
                          href="/materials" 
                          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                          Upload Material
                        </a>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {userMaterials.map((material) => (
                          <div 
                            key={material.id} 
                            className="border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                          >
                            <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
                              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2">{material.title}</h3>
                            <p className="text-xs text-slate-500">{material.subject || 'Study Material'}</p>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
