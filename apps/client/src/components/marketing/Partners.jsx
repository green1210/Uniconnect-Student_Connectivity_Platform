import React from 'react';
import SectionHeading from './SectionHeading.jsx';

const logos = [
  { name: 'MIT', color: 'from-red-600 to-red-700' },
  { name: 'Stanford', color: 'from-red-700 to-red-800' },
  { name: 'Harvard', color: 'from-red-800 to-red-900' },
  { name: 'Oxford', color: 'from-blue-700 to-blue-800' },
  { name: 'Cambridge', color: 'from-blue-600 to-blue-700' },
  { name: 'Berkeley', color: 'from-yellow-600 to-yellow-700' }
];
export default function Partners() {
  return (
    <section className="py-20 bg-gray-50">
      <SectionHeading eyebrow="Partners" title="Trusted by Leading Universities" description="Supporting students at world-class institutions worldwide." />
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {logos.map(l => (
          <div key={l.name} className="h-24 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-4 hover:border-blue-300 hover:shadow-lg transition-all group">
            <div className={`text-center bg-gradient-to-br ${l.color} bg-clip-text text-transparent font-black text-lg group-hover:scale-110 transition-transform`}>
              {l.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
