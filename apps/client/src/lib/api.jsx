/**
 * API helper function for making HTTP requests to the backend
 * 
 * Automatically includes Clerk authentication token from localStorage
 * and handles JSON serialization/deserialization
 * 
 * @param {string} endpoint - API endpoint (e.g., '/feed', '/profile/123')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - Parsed JSON response
 * 
 * @example
 * // GET request
 * const posts = await api('/feed');
 * 
 * // POST request
 * const newPost = await api('/feed', {
 *   method: 'POST',
 *   body: JSON.stringify({ content: 'Hello world!' })
 * });
 * 
 * // DELETE request
 * await api('/feed/123', { method: 'DELETE' });
 */

// Use VITE_API_URL in production, relative path in development
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  // Build full URL: use API_BASE for production, relative for dev
  const path = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}${path}` : path;

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  // Handle empty responses (like 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
