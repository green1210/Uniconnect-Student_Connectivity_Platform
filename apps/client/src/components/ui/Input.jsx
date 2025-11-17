import React from 'react';
export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 ${className}`}
      {...props}
    />
  );
}
