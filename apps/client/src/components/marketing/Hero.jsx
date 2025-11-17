import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 min-h-[90vh] flex items-center">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-floatSlow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-floatSlow" style={{animationDelay: '1s'}} />
      
      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 text-sm font-medium text-blue-200 animate-fade">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Now in Beta</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.1] text-balance animate-fade-up">
              Connect. Learn.
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">Build Together.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100/80 leading-relaxed max-w-xl animate-fade-up animate-delay-100">
              Join thousands of students worldwide collaborating on projects, sharing knowledge, and building the future with AI-powered tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-up animate-delay-200">
              <Link to="/register" className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 text-center">
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              </Link>
              <Link to="/login" className="px-8 py-4 rounded-xl font-semibold text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-center backdrop-blur-sm">
                Sign In
              </Link>
            </div>
            
            {/* Social proof */}
            <div className="flex items-center gap-6 pt-8 text-blue-200/60 text-sm animate-fade-up animate-delay-300">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/150?img=1" alt="User" className="w-8 h-8 rounded-full ring-2 ring-blue-950 object-cover" />
                <img src="https://i.pravatar.cc/150?img=5" alt="User" className="w-8 h-8 rounded-full ring-2 ring-blue-950 object-cover" />
                <img src="https://i.pravatar.cc/150?img=8" alt="User" className="w-8 h-8 rounded-full ring-2 ring-blue-950 object-cover" />
                <img src="https://i.pravatar.cc/150?img=12" alt="User" className="w-8 h-8 rounded-full ring-2 ring-blue-950 object-cover" />
              </div>
              <span>Join 10,000+ students worldwide</span>
            </div>
          </div>
          
          {/* Right visual */}
          <div className="hidden lg:block relative">
            <div className="relative w-full max-w-2xl mx-auto">
              {/* Main hero image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" 
                  alt="Students collaborating" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                <div className="text-center">
                  <div className="text-3xl mb-1">⭐</div>
                  <div className="text-xs font-bold text-gray-900">4.9/5</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
