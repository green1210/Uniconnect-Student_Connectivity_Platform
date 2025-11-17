import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function Register() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
			<div className="container mx-auto px-4 py-12">
				<div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
					<div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl w-full">
						{/* Left side - Features */}
						<div className="space-y-8 lg:pr-8">
							<div className="space-y-4">
								<div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
									🚀 Get Started Free
								</div>
								<h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
									Join the Future of
									<span className="block bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
										Student Learning
									</span>
								</h1>
								<p className="text-xl text-gray-600 leading-relaxed">
									Create your free account and start connecting with students worldwide.
								</p>
							</div>

							{/* Benefits List */}
							<div className="space-y-4">
								<div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-md border border-gray-100">
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
										</svg>
									</div>
									<div>
										<h3 className="font-bold text-gray-900 mb-1">Access Shared Resources</h3>
										<p className="text-sm text-gray-600">Study materials, notes, and assignments from thousands of students</p>
									</div>
								</div>

								<div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-md border border-gray-100">
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
										</svg>
									</div>
									<div>
										<h3 className="font-bold text-gray-900 mb-1">Collaborate on Projects</h3>
										<p className="text-sm text-gray-600">Work together with peers on assignments and group projects</p>
									</div>
								</div>

								<div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-md border border-gray-100">
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
										</svg>
									</div>
									<div>
										<h3 className="font-bold text-gray-900 mb-1">AI-Powered Study Assistant</h3>
										<p className="text-sm text-gray-600">Get instant help with questions and personalized learning support</p>
									</div>
								</div>

								<div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-md border border-gray-100">
									<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0">
										<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
										</svg>
									</div>
									<div>
										<h3 className="font-bold text-gray-900 mb-1">100% Free Forever</h3>
										<p className="text-sm text-gray-600">All features included at no cost. No credit card required</p>
									</div>
								</div>
							</div>
					</div>

					{/* Right side - Sign Up Form */}
					<div className="w-full max-w-[520px] mx-auto">
						<SignUp 
							signInUrl="/login"
								afterSignUpUrl="/dashboard"
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
