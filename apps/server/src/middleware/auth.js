import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

/**
 * Authentication middleware using Clerk JWT verification
 * 
 * Validates Clerk session tokens on protected routes.
 * Attaches user data to req.auth if valid.
 * 
 * Usage: Applied in index.js to protect API routes
 */
const authMiddleware = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error('[AUTH_ERROR]', error.message);
    console.error('[AUTH_ERROR] Full error:', error);
    return {
      status: 401,
      message: 'Unauthorized - Invalid or expired token'
    };
  }
});

// Wrap middleware to add logging
const wrappedAuth = (req, res, next) => {
  console.log('[AUTH] Attempting authentication for:', req.path);
  console.log('[AUTH] Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  
  authMiddleware(req, res, (err) => {
    if (err) {
      console.error('[AUTH] Middleware error:', err);
      return res.status(401).json({ error: 'Authentication failed', details: err.message });
    }
    console.log('[AUTH] Success, userId:', req.auth?.userId);
    next();
  });
};

export default wrappedAuth;
