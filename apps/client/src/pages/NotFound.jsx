import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <p className="text-xl text-subtle mb-6">Page not found</p>
        <Link to="/" className="px-6 py-3 rounded-xl bg-primary-500 text-white shadow-soft hover:bg-primary-600 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}
