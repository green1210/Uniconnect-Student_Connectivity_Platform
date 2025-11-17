import React from 'react';
import SectionHeading from './SectionHeading.jsx';

const quotes = [
  { name: 'Aria Chen', role: 'ML Engineering Student', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', text: 'UniConnect transformed how I collaborate. Finding study partners and resources has never been easier!' },
  { name: 'Jin Park', role: 'Product Design', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', text: 'The AI Study Buddy is a game-changer. It helps me stay organized and focused on what matters most.' },
  { name: 'Samuel Torres', role: 'BioTech Research', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', text: 'Best platform for student collaboration. The forums and project tools are exactly what we needed.' }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <SectionHeading eyebrow="Testimonials" title="Loved by Students Worldwide" description="Join thousands of learners already transforming their education." />
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {quotes.map(q => (
          <div key={q.name} className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="text-4xl mb-4 text-blue-500">"</div>
            <p className="text-gray-700 leading-relaxed mb-6">{q.text}</p>
            <div className="flex items-center gap-3">
              <img src={q.avatar} alt={q.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200" />
              <div>
                <div className="font-bold text-gray-900 text-sm">{q.name}</div>
                <div className="text-xs text-gray-600">{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
