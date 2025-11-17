import React from 'react';
export default function Card({ className = '', ...props }) {
  return <div className={`bg-surface border border-primary-100 rounded-xl p-4 shadow-soft ${className}`} {...props} />;
}
