import React from 'react';
export default function Avatar({ name = 'U', size = 36, src }) {
  const initials = name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();
  return (
    <div className="rounded-full bg-primary-100 text-primary-800 flex items-center justify-center" style={{ width: size, height: size }}>
      {src ? <img src={src} alt={name} className="rounded-full w-full h-full object-cover"/> : <span className="text-xs font-semibold">{initials}</span>}
    </div>
  );
}
