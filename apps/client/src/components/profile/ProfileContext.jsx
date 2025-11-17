import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../lib/api.jsx';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Wait for token to be available in localStorage
      let attempts = 0;
      while (attempts < 10) {
        const token = localStorage.getItem('auth_token');
        if (token) break;
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      const data = await api('/profile');
      setProfile(data);
    } catch (err) {
      setError(err.message);
      console.error('[ProfileContext] Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (updatedData) => {
    try {
      const updated = await api('/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const refreshProfile = useCallback(() => {
    return loadProfile();
  }, [loadProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
