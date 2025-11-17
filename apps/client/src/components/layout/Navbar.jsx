import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser, UserButton, useClerk } from '@clerk/clerk-react';
import { useProfile } from '../profile/ProfileContext.jsx';
import { api } from '../../lib/api.jsx';

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { profile } = useProfile();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200" role="banner" aria-label="Site header">
      <a href="#main-content" className="absolute left-2 top-2 -translate-y-14 focus:translate-y-0 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium transition">Skip to content</a>
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="UniConnect home">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow-md transition-all">
              U
            </div>
            <span className="text-xl font-semibold text-slate-900">UniConnect</span>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2" aria-label="Primary navigation">
            {isSignedIn ? (
              <>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                
                {/* Notifications */}
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* Profile */}
                <div className="ml-2 flex items-center gap-3 relative">
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile?.name || 'Profile'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                        {profile?.name?.[0] || user?.firstName?.[0] || 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            {profile?.avatar ? (
                              <img
                                src={profile.avatar}
                                alt={profile?.name || 'Profile'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {profile?.name?.[0] || user?.firstName?.[0] || 'U'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {profile?.name || user?.fullName || user?.firstName || 'User'}
                              </p>
                              <p className="text-sm text-slate-500 truncate">
                                {profile?.profile?.university || 'Student'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>View Profile</span>
                        </Link>

                        <div className="border-t border-slate-200 my-2" />

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition" aria-label="Login">Sign in</Link>
                <Link to="/register" className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all" aria-label="Register">Join now</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
