import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.jsx';
import { useProfile } from '../components/profile/ProfileContext.jsx';

export default function Dashboard() {
	const { profile, loading } = useProfile();
	const [recentActivity, setRecentActivity] = useState([]);
	const [activityLoading, setActivityLoading] = useState(true);

	useEffect(() => {
		loadActivity();
	}, []);

	const loadActivity = async () => {
		try {
			setActivityLoading(true);
			// Get recent posts and threads as activity
			const [posts, threads] = await Promise.all([
				api('/feed').catch(() => []),
				api('/forums').catch(() => [])
			]);
			
			// Combine and sort by date
			const activity = [
				...posts.slice(0, 5).map(p => ({ type: 'post', ...p })),
				...threads.slice(0, 5).map(t => ({ type: 'thread', ...t }))
			].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
			
			setRecentActivity(activity);
		} catch (err) {
			console.error('Failed to load activity:', err);
			setRecentActivity([]);
		} finally {
			setActivityLoading(false);
		}
	};

	const upcomingTasks = [];

	const stats = [
		{ 
			label: 'Study Materials', 
			value: profile?._count?.materials || 0, 
			icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
			color: 'text-blue-600', 
			bgColor: 'bg-blue-50', 
			borderColor: 'border-blue-200', 
			link: '/materials' 
		},
		{ 
			label: 'Active Projects', 
			value: profile?._count?.projects || 0, 
			icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
			color: 'text-purple-600', 
			bgColor: 'bg-purple-50', 
			borderColor: 'border-purple-200', 
			link: '/projects' 
		},
		{ 
			label: 'Forum Threads', 
			value: profile?._count?.threads || 0, 
			icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>,
			color: 'text-green-600', 
			bgColor: 'bg-green-50', 
			borderColor: 'border-green-200', 
			link: '/forums' 
		},
		{ 
			label: 'Posts', 
			value: profile?._count?.posts || 0, 
			icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
			color: 'text-orange-600', 
			bgColor: 'bg-orange-50', 
			borderColor: 'border-orange-200', 
			link: '/feed' 
		},
	];

	// Show loading state while profile is being fetched
	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="text-center">
					<svg className="animate-spin w-12 h-12 mx-auto mb-4 text-blue-600" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
					<div className="text-slate-600 font-medium">Loading your dashboard...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Professional Header - LinkedIn style */}
			<div className="bg-white border-b border-slate-200">
				<div className="max-w-[1280px] mx-auto px-6 py-8">
					<div className="flex items-start gap-6">
						{profile?.avatar ? (
							<img
								src={profile.avatar}
								alt={profile?.name || 'Profile'}
								className="w-24 h-24 rounded-xl object-cover border-4 border-slate-100 shadow-lg"
							/>
						) : (
							<div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
								{profile?.name?.[0] || 'U'}
							</div>
						)}
						<div className="flex-1">
							<h1 className="text-3xl font-bold text-slate-900 mb-2">
								Welcome back, {profile?.name || 'Student'}!
							</h1>
							<p className="text-slate-600 mb-4">Here's what's happening with your learning journey today.</p>
							<div className="flex gap-3">
								<Link to="/feed" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
									Share an update
								</Link>
								<Link to="/forums" className="px-4 py-2 bg-white text-slate-700 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
									Ask a question
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-[1280px] mx-auto px-6 py-8">
				{/* Stats Grid - Clean cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{stats.map((stat) => (
						<Link
							key={stat.label}
							to={stat.link}
							className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all group"
						>
							<div className="flex items-start justify-between mb-4">
								<div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
									{stat.icon}
								</div>
							</div>
							<div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
							<div className="text-sm text-slate-600">{stat.label}</div>
						</Link>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Recent Activity - Notion style */}
					<div className="lg:col-span-2 space-y-4">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
							<Link to="/feed" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
						</div>
						
						{activityLoading ? (
							<div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
								<p className="text-sm text-slate-600">Loading activity...</p>
							</div>
						) : recentActivity.length > 0 ? (
							<div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
								{recentActivity.map((activity, index) => (
									<div key={index} className="p-4 hover:bg-slate-50 transition-colors">
										<div className="flex items-start gap-3">
											<div className="text-2xl">{activity.icon}</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm text-slate-900 font-medium mb-1">{activity.title}</p>
												<div className="text-xs text-slate-500">{activity.time}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
								<div className="text-5xl mb-3">🎯</div>
								<h3 className="text-lg font-semibold text-slate-900 mb-2">No activity yet</h3>
								<p className="text-sm text-slate-600">Start engaging with the community to see updates here</p>
							</div>
						)}

						{/* Quick Actions - Coursera style */}
						<div className="mt-6">
							<h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
							<div className="grid grid-cols-2 gap-3">
								<Link to="/materials" className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all">
									<div className="text-2xl mb-2">📤</div>
									<div className="font-semibold text-slate-900 text-sm mb-1">Upload Material</div>
									<div className="text-xs text-slate-500">Share resources</div>
								</Link>
								<Link to="/projects" className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all">
									<div className="text-2xl mb-2">✨</div>
									<div className="font-semibold text-slate-900 text-sm mb-1">New Project</div>
									<div className="text-xs text-slate-500">Start collaborating</div>
								</Link>
								<Link to="/forums" className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all">
									<div className="text-2xl mb-2">💭</div>
									<div className="font-semibold text-slate-900 text-sm mb-1">Start Discussion</div>
									<div className="text-xs text-slate-500">Ask community</div>
								</Link>
								<Link to="/ai-buddy" className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all">
									<div className="text-2xl mb-2">🤖</div>
									<div className="font-semibold text-slate-900 text-sm mb-1">AI Assistant</div>
									<div className="text-xs text-slate-500">Get help instantly</div>
								</Link>
							</div>
						</div>
					</div>

					{/* Sidebar - Tasks & Widgets */}
					<div className="space-y-4">
						{/* Upcoming Tasks */}
						<div>
							<h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming Tasks</h2>
							{upcomingTasks.length > 0 ? (
								<div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
									{upcomingTasks.map((task, index) => (
										<div key={index} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
											<div className="flex items-start gap-3">
												<div className={`w-2 h-2 rounded-full mt-1.5 ${
													task.priority === 'high' ? 'bg-red-500' :
													task.priority === 'medium' ? 'bg-yellow-500' :
													'bg-green-500'
												}`} />
												<div className="flex-1 min-w-0">
													<div className="text-sm font-medium text-slate-900 mb-1">{task.title}</div>
													<div className="text-xs text-slate-500">{task.due}</div>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
									<div className="text-4xl mb-2">📝</div>
									<p className="text-sm text-slate-600">No upcoming tasks</p>
								</div>
							)}
						</div>

						{/* Study Streak */}
						<div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
							<div className="text-4xl mb-3">🔥</div>
							<div className="text-2xl font-bold mb-1">0 Days</div>
							<div className="text-sm text-white/80">Start your study streak today!</div>
						</div>

						{/* AI Buddy Promo */}
						<div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
							<div className="text-4xl mb-3">🤖</div>
							<div className="text-lg font-bold mb-2">AI Study Buddy</div>
							<div className="text-sm text-white/90 mb-4">Get instant help with your studies</div>
							<Link to="/ai-buddy" className="inline-block px-4 py-2 bg-white text-green-600 font-semibold text-sm rounded-lg hover:bg-green-50 transition-colors">
								Try now
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
