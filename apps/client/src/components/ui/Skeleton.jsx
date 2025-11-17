import React from 'react';
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-primary-100/60 rounded ${className}`}/>;
}
