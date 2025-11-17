import React from 'react';
export default function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  return (
    <div className={`max-w-3xl mx-auto mb-12 text-${align} px-6`}>      
      {eyebrow && <p className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1 rounded-full mb-4">{eyebrow}</p>}
      <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 text-balance">{title}</h2>
      {description && <p className="text-xl text-gray-600 leading-relaxed">{description}</p>}
    </div>
  );
}
