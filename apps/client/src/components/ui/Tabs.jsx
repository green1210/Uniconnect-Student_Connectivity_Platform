import React, { useState } from 'react';
export default function Tabs({ tabs = [], onChange }) {
  const [active, setActive] = useState(0);
  const change = (i)=>{ setActive(i); onChange && onChange(i); };
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {tabs.map((t, i) => (
          <button key={i} className={`px-3 py-1.5 rounded-full text-sm ${i===active?'bg-primary-500 text-white':'bg-primary-50 text-primary-800'}`} onClick={()=>change(i)}>{t.label}</button>
        ))}
      </div>
      <div className="animate-fade">{tabs[active]?.content}</div>
    </div>
  );
}
