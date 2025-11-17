import React, { useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { ProfileProvider } from './components/profile/ProfileContext.jsx';
import Layout from './components/layout/Layout.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Feed from './pages/Feed.jsx';
import Forums from './pages/Forums.jsx';
import Projects from './pages/Projects.jsx';
import Materials from './pages/Materials.jsx';
import Messenger from './pages/Messenger.jsx';
import AiBuddy from './pages/AiBuddy.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import ForumThreadDetail from './pages/ForumThreadDetail.jsx';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error('Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file.');
}

function ProtectedRoute({ children, requiredRole }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

// Component to handle token sync from Clerk
function TokenSyncWrapper({ children }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    async function syncToken() {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            localStorage.setItem('auth_token', token);
          }
        } catch (err) {
          console.error('Token sync failed:', err);
        }
      } else {
        localStorage.removeItem('auth_token');
      }
    }

    syncToken();
    // Re-sync token every 30 seconds to keep it fresh
    const interval = setInterval(syncToken, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return children;
}

export default function App() {
  console.log('App render start');
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <TokenSyncWrapper>
        <ProfileProvider>
          <ErrorBoundary>
            <Layout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/forums" element={<ProtectedRoute><Forums /></ProtectedRoute>} />
                <Route path="/forums/:id" element={<ProtectedRoute><ForumThreadDetail /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
                <Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
                <Route path="/ai-buddy" element={<ProtectedRoute><AiBuddy /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ErrorBoundary>
        </ProfileProvider>
      </TokenSyncWrapper>
    </ClerkProvider>
  );
}
