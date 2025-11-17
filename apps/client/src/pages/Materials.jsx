import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../lib/api.jsx';

export default function Materials() {
  const { user } = useUser();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', category: 'notes' });
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await api('/materials');
      setMaterials(data || []);
    } catch (error) {
      console.error('[MATERIALS_LOAD_ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!newMaterial.title.trim() || uploading) return;
    
    if (uploadType === 'url' && !newMaterial.url.trim()) {
      alert('Please enter a URL');
      return;
    }
    
    if (uploadType === 'file' && !selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      let material;
      
      if (uploadType === 'url') {
        // Upload via URL
        material = await api('/materials', {
          method: 'POST',
          body: JSON.stringify(newMaterial)
        });
      } else {
        // Upload file
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', newMaterial.title);
        formData.append('category', newMaterial.category);
        
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/materials/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }
        
        material = await response.json();
      }
      
      setMaterials([material, ...materials]);
      setNewMaterial({ title: '', url: '', category: 'notes' });
      setSelectedFile(null);
      setUploadType('url');
      setShowUploadModal(false);
    } catch (error) {
      console.error('[MATERIAL_UPLOAD_ERROR]', error);
      alert('Failed to upload material: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!confirm('Delete this material?')) return;

    try {
      await api(`/materials/${materialId}`, { method: 'DELETE' });
      setMaterials(materials.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('[MATERIAL_DELETE_ERROR]', error);
      alert('Failed to delete material');
    }
  };

  const filteredMaterials = filter === 'all' 
    ? materials 
    : materials.filter(m => m.category === filter);

  // Apply search filter
  const searchedMaterials = searchQuery.trim()
    ? filteredMaterials.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.uploader?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredMaterials;

  const getCategoryIcon = (category) => {
    const icons = {
      notes: '📝',
      books: '📚',
      videos: '🎥',
      assignments: '📋',
      other: '📌'
    };
    return icons[category] || icons.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Materials</h1>
            <p className="text-slate-600">Share and access study resources</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            + Upload Material
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 flex-wrap">
          {['all', 'notes', 'books', 'videos', 'assignments', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === cat
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat === 'all' ? '🗂️ All' : `${getCategoryIcon(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, uploader, or category..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Upload Material</h2>
              
              {/* Upload Type Toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    uploadType === 'file'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📁 Upload from Device
                </button>
                <button
                  onClick={() => setUploadType('url')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    uploadType === 'url'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔗 Share URL
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    placeholder="e.g., Calculus Notes Chapter 5"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="notes">📝 Notes</option>
                    <option value="books">📚 Books</option>
                    <option value="videos">🎥 Videos</option>
                    <option value="assignments">📋 Assignments</option>
                    <option value="other">📌 Other</option>
                  </select>
                </div>

                {uploadType === 'file' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select File</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.mp4,.mp3,.zip,.rar"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-slate-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Max 50MB. Supported: PDF, DOC, PPT, XLS, images, videos, ZIP</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">URL</label>
                    <input
                      type="url"
                      value={newMaterial.url}
                      onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Share a link to Google Drive, Dropbox, or any accessible URL</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setNewMaterial({ title: '', url: '', category: 'notes' });
                    setSelectedFile(null);
                    setUploadType('url');
                  }}
                  className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={
                    !newMaterial.title.trim() || 
                    (uploadType === 'url' && !newMaterial.url.trim()) ||
                    (uploadType === 'file' && !selectedFile) ||
                    uploading
                  }
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (uploadType === 'file' ? 'Uploading file...' : 'Uploading...') : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Materials Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Loading materials...</div>
          </div>
        ) : searchedMaterials.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="text-6xl mb-4">📚</div>
            <div className="text-slate-600 font-semibold mb-2">No materials found</div>
            <div className="text-slate-500 text-sm">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : filter === 'all' 
                  ? 'Be the first to share resources!' 
                  : `No materials in ${filter} category`}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchedMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getCategoryIcon(material.category)}</div>
                  {material.uploaderId === user?.id && (
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{material.title}</h3>
                
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <span className="font-medium">{material.uploader?.name || material.uploader?.email?.split('@')[0]}</span>
                </div>

                {material.filePath && (
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <span>📎 {material.fileName || 'File'}</span>
                    {material.fileSize && <span>({(material.fileSize / 1024 / 1024).toFixed(2)} MB)</span>}
                  </div>
                )}

                <a
                  href={material.url || material.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={material.filePath ? material.fileName : undefined}
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  {material.filePath ? '📥 Download' : '🔗 Open Material'}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
