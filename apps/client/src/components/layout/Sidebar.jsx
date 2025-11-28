import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useProfile } from '../profile/ProfileContext.jsx';
import { api, getMediaUrl } from '../../lib/api.jsx';

const links = [
  { 
    to: '/dashboard', 
    label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  },
  { 
    to: '/feed', 
    label: 'Feed',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
  },
  { 
    to: '/forums', 
    label: 'Forums',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
  },
  { 
    to: '/projects', 
    label: 'Projects',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  },
  { 
    to: '/materials', 
    label: 'Materials',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  },
  { 
    to: '/messenger', 
    label: 'Messenger',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  },
  { 
    to: '/ai-buddy', 
    label: 'AI Buddy',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
  },
  { 
    to: '/profile', 
    label: 'Profile',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  }
];

export default function Sidebar() {
  const { user } = useUser();
  const { profile } = useProfile();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const sidebarRef = useRef(null);
  const triggerZoneRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  
  useEffect(() => {
    if (profile?.id) {
      loadPosts();
    }
  }, [profile?.id]);

  const loadPosts = async () => {
    try {
      const feedData = await api('/feed');
      const userPosts = feedData?.filter(post => post.authorId === profile.id) || [];
      setPosts(userPosts);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };
  
  // Handle mouse move for auto-open/close
  useEffect(() => {
    const handleMouseMove = (e) => {
      const triggerZone = triggerZoneRef.current;
      
      // If cursor is in left edge trigger zone (0-10px from left), open sidebar
      if (e.clientX < 10) {
        setIsOpen(true);
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
      }
      // If cursor moves far to the right (past sidebar width), close it
      else if (e.clientX > 280 && isOpen && sidebarRef.current) {
        // Check if cursor is not over sidebar
        const rect = sidebarRef.current.getBoundingClientRect();
        if (e.clientX > rect.right) {
          closeTimeoutRef.current = setTimeout(() => {
            setIsOpen(false);
          }, 300);
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen]);
  
  // Close sidebar when mouse leaves sidebar area
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };
  
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };
  
  if (!user) return null;
  return (
    <>
      {/* Trigger Zone - Left edge to detect cursor */}
      <div
        ref={triggerZoneRef}
        className="hidden lg:block fixed left-0 top-16 bottom-0 w-1 z-30 cursor-pointer"
        onMouseEnter={handleMouseEnter}
      />

      {/* Overlay - appears when sidebar is open */}
      {isOpen && (
        <div
          className="hidden lg:block fixed inset-0 bg-black/20 z-20 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar - hover slide-out on left edge */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-16 bottom-0 w-64 border-r border-slate-200 bg-white transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto hidden lg:block ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Section navigation"
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <div className="h-full flex flex-col">
          {/* User Card - Notion style */}
          <div className="p-4 border-b border-slate-200">
            <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all">
              {profile?.avatar ? (
                <img
                  src={getMediaUrl(profile.avatar)}
                  alt={profile?.name || 'Profile'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                  {profile?.name?.[0] || user?.firstName?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {profile?.name || user?.fullName || user?.firstName || 'User'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {profile?.profile?.university || 'Student'}
                </div>
              </div>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {links.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      pathname === link.to
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    aria-current={pathname === link.to ? 'page' : undefined}
                  >
                    <span className={pathname === link.to ? 'text-blue-700' : 'text-slate-500'}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Quick Stats - Coursera style */}
          <div className="p-4 mx-3 mb-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
            <div className="text-xs font-semibold text-slate-700 mb-2">Your Activity</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Posts</span>
                <span className="font-semibold text-slate-900">{posts.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Threads</span>
                <span className="font-semibold text-slate-900">{profile?.threads?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Projects</span>
                <span className="font-semibold text-slate-900">{profile?.projects?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - button toggle for small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-8 left-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-40 flex items-center justify-center"
        aria-label="Toggle navigation menu"
        title="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-64 border-r border-slate-200 bg-white transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="p-4">
          {/* Close Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Card - Mobile */}
          <Link to="/profile" onClick={() => setIsOpen(false)} className="block p-3 rounded-lg hover:bg-slate-50 transition-all mb-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              {profile?.avatar ? (
                <img
                  src={getMediaUrl(profile.avatar)}
                  alt={profile?.name || 'Profile'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                  {profile?.name?.[0] || user?.firstName?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {profile?.name || user?.fullName || user?.firstName || 'User'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {profile?.profile?.university || 'Student'}
                </div>
              </div>
            </div>
          </Link>
          
          {/* Navigation Links - Mobile */}
          <nav>
            <ul className="space-y-1">
              {links.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      pathname === link.to
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    aria-current={pathname === link.to ? 'page' : undefined}
                  >
                    <span className={pathname === link.to ? 'text-blue-700' : 'text-slate-500'}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Quick Stats - Mobile */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
            <div className="text-xs font-semibold text-slate-700 mb-3">Your Activity</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Posts</span>
                <span className="font-semibold text-slate-900">{posts.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Threads</span>
                <span className="font-semibold text-slate-900">{profile?.threads?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Projects</span>
                <span className="font-semibold text-slate-900">{profile?.projects?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
