import React from 'react';
import SectionHeading from './SectionHeading.jsx';
import FeatureCard from './FeatureCard.jsx';

const data = [
  { icon: '📊', title: 'Student Dashboard', text: 'Personalized hub for progress, tasks, communities and learning momentum.' },
  { icon: '🌐', title: 'Campus Social Feed', text: 'Academic-focused sharing: posts, resources, culture, achievements & inspiration.' },
  { icon: '📚', title: 'Study Materials', text: 'Curated notes, previous papers and domain resources filtered intelligently.' },
  { icon: '🤝', title: 'Project Collaboration', text: 'Spin up team workspaces, manage ideas, iterate and build prototypes.' },
  { icon: '🚀', title: 'Startup Hub', text: 'Showcase ventures, network with founders, pitch early-stage innovation.' },
  { icon: '💬', title: 'Discussion Forums', text: 'Structured Q&A boards for mentorship, peer review and doubt resolution.' },
  { icon: '🤖', title: 'AI Study Buddy', text: 'Adaptive guidance, study planning, prioritized learning and productivity insights.' },
  { icon: '🔐', title: 'Secure & Private', text: 'Role-based access, protected student spaces and trust-centered architecture.' }
];

export default function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50">
      <SectionHeading eyebrow="Platform" title="Everything You Need to Succeed" description="Powerful tools and features designed for modern student collaboration and learning." />
      <div className="max-w-7xl mx-auto px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-12">
        {data.map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </section>
  );
}
