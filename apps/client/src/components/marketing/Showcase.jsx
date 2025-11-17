import React from 'react';
import SectionHeading from './SectionHeading.jsx';

export default function Showcase() {
  return (
    <section className="py-24 bg-gray-50">
      <SectionHeading eyebrow="Platform" title="Built for Modern Learning" description="Everything you need to collaborate, create, and succeed in one powerful platform." />
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mb-3">1</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Smart Dashboard</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Personalized feed with upcoming tasks, project updates, and intelligent recommendations tailored to your learning goals.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg mb-3">2</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Team Collaboration</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Real-time workspaces, version control, and intelligent matching to find the perfect teammates for your projects.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg mb-3">3</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">AI Study Assistant</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Get instant help, personalized study plans, and smart resource recommendations powered by advanced AI.</p>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80" 
              alt="Team collaboration workspace" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/95 to-indigo-600/85 flex items-center justify-center p-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 mb-4">
                  <div className="text-5xl">🎓</div>
                </div>
                <div>
                  <p className="text-white font-black text-3xl mb-3">Your Learning Hub</p>
                  <p className="text-blue-100 text-base leading-relaxed max-w-md mx-auto">Everything you need in one powerful platform - from collaboration tools to AI assistance, all designed for student success.</p>
                </div>
                <div className="grid grid-cols-3 gap-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">50+</div>
                    <div className="text-xs text-blue-200">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">10k+</div>
                    <div className="text-xs text-blue-200">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">24/7</div>
                    <div className="text-xs text-blue-200">AI Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
