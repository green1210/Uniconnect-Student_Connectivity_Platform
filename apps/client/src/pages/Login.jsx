import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function Login() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
			<div className="container mx-auto px-4 py-12">
				<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
					<div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl w-full">
						{/* Left side - Features */}
						<div className="space-y-8 lg:pr-8">
							<div className="space-y-4">
								<div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
									✨ Welcome Back
								</div>
								<h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
									Continue Your
									<span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
										Learning Journey
									</span>
								</h1>
								<p className="text-xl text-gray-600 leading-relaxed">
									Join thousands of students collaborating and learning together on UniConnect.
								</p>
							</div>

							{/* Features Grid */}
							<div className="grid grid-cols-2 gap-6">
								<div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
									<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
										</svg>
									</div>
									<h3 className="font-bold text-gray-900 mb-2">Study Materials</h3>
									<p className="text-sm text-gray-600">Access shared notes & resources</p>
								</div>

								<div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
									<div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
										</svg>
									</div>
									<h3 className="font-bold text-gray-900 mb-2">Community</h3>
									<p className="text-sm text-gray-600">Connect with students worldwide</p>
								</div>

								<div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
									<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
									</div>
									<h3 className="font-bold text-gray-900 mb-2">AI Study Buddy</h3>
									<p className="text-sm text-gray-600">Get instant help 24/7</p>
								</div>

								<div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
									<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<h3 className="font-bold text-gray-900 mb-2">Project Collab</h3>
									<p className="text-sm text-gray-600">Work together on projects</p>
								</div>
							</div>

							{/* Stats */}
							<div className="flex items-center gap-8 pt-4">
								<div>
									<div className="text-3xl font-bold text-gray-900">10K+</div>
									<div className="text-sm text-gray-600">Active Students</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-gray-900">500+</div>
									<div className="text-sm text-gray-600">Universities</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-gray-900">50K+</div>
									<div className="text-sm text-gray-600">Resources</div>
								</div>
							</div>
					</div>

					{/* Right side - Sign In Form */}
					<div className="w-full max-w-[520px] mx-auto">
						<SignIn 
							signUpUrl="/register"
								afterSignInUrl="/dashboard"
								appearance={{
									elements: {
										rootBox: 'w-full',
										card: 'shadow-xl rounded-2xl w-full',
										headerTitle: 'text-2xl font-bold',
										headerSubtitle: 'text-gray-600',
										socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all text-base font-medium h-12',
										socialButtonsBlockButtonText: 'font-medium text-base',
										formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 text-base font-semibold',
										formFieldInput: 'h-12 text-base border-2 border-gray-300 focus:border-blue-500',
										formFieldLabel: 'text-gray-700 font-medium text-base',
										footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
										footerActionText: 'text-gray-600',
										dividerLine: 'bg-gray-300',
										dividerText: 'text-gray-500',
									}
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
