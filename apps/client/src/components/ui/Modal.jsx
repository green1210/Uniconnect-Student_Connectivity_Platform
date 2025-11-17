import React from 'react';
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade">
      <div className="bg-white rounded-xl shadow-soft w-full max-w-lg animate-slideUp">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-subtle">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
