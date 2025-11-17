import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.jsx';

export default function ForumThreadItem({ 
	id = '1',
	title = 'How to prepare for exams?', 
	body = 'Looking for effective study strategies...',
	authorName = 'Alex', 
	authorUsername = '',
	authorId = '',
	replies = 5,
	views = 42,
	createdAt = '2h',
	category = 'general'
}) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [syncStatus, setSyncStatus] = useState(null);
	const [isSyncing, setIsSyncing] = useState(false);

	const handleSync = async () => {
		if (!authorId) return;
		setIsSyncing(true);
		try {
			await api('/sync/request', {
				method: 'POST',
				body: { targetUserId: authorId }
			});
			setSyncStatus('requested');
			setTimeout(() => setSyncStatus(null), 3000);
		} catch (error) {
			console.error('Sync request failed:', error);
			setSyncStatus('failed');
			setTimeout(() => setSyncStatus(null), 3000);
		} finally {
			setIsSyncing(false);
		}
	};

	const getInitials = (name) => {
		if (!name) return 'U';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const formatTime = (timeValue) => {
		if (!timeValue) return '2h';
		if (typeof timeValue === 'string') return timeValue;
		if (timeValue instanceof Date) {
			const now = new Date();
			const diff = Math.floor((now - timeValue) / 1000 / 60);
			if (diff < 60) return `${diff}m`;
			if (diff < 1440) return `${Math.floor(diff / 60)}h`;
			return `${Math.floor(diff / 1440)}d`;
		}
		return '2h';
	};

	const getCategoryBadge = (cat) => {
		const badges = {
			study: { icon: '✏️', color: 'from-purple-500 to-pink-500', label: 'Study Tips' },
			tech: { icon: '💻', color: 'from-green-500 to-emerald-500', label: 'Tech Help' },
			career: { icon: '🎯', color: 'from-orange-500 to-red-500', label: 'Career' },
			general: { icon: '💬', color: 'from-indigo-500 to-blue-500', label: 'General' },
		};
		return badges[cat] || badges.general;
	};

	const badge = getCategoryBadge(category);
	const colors = [
		'from-blue-500 to-cyan-500',
		'from-purple-500 to-pink-500',
		'from-green-500 to-emerald-500',
		'from-orange-500 to-red-500',
	];
	const colorIndex = (authorName?.length || 0) % colors.length;

	return (
		<div className="bg-white rounded-lg shadow border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all group">
			<div>
				{/* Header */}
				<div className="flex items-start gap-4 mb-4">
					<div className="flex-shrink-0">
						<div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-base`}>
							{getInitials(authorName)}
						</div>
					</div>
					
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-3 mb-2 flex-wrap">
							<div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${badge.color} text-white text-xs font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all`}>
								<span>{badge.icon}</span>
								<span>{badge.label}</span>
							</div>
							<span className="text-xs text-slate-500 font-semibold">
								{formatTime(createdAt)} ago
							</span>
						</div>
						
							<h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-purple-600 transition-colors cursor-pointer leading-tight">
								{title}
							</h3>						<div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
							<span className="font-semibold">by {authorName}</span>{' '}
							{authorUsername && <span className="text-slate-500">@{authorUsername}</span>}
						</div>

						{body && (
							<div className="mb-4">
								<p className={`text-slate-700 leading-relaxed font-medium ${!isExpanded && 'line-clamp-2'}`}>
									{body}
								</p>
								{body.length > 100 && (
									<button
										onClick={() => setIsExpanded(!isExpanded)}
										className="text-purple-600 text-sm font-bold hover:text-purple-700 hover:underline mt-2 transition-all"
									>
										{isExpanded ? '↑ Show less' : '↓ Read more'}
									</button>
								)}
							</div>
						)}

						{/* Stats Bar */}
						<div className="flex items-center gap-6 pt-3 border-t border-slate-200">
							<div className="flex items-center gap-2">
								<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
								<span className="text-sm font-semibold text-slate-700">{replies}</span>
								<span className="text-sm text-slate-500">replies</span>
							</div>
							<div className="flex items-center gap-2">
								<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
								<span className="text-sm font-semibold text-slate-700">{views}</span>
								<span className="text-sm text-slate-500">views</span>
							</div>
							<div className="ml-auto flex items-center gap-3">
								<button
									onClick={handleSync}
									disabled={isSyncing}
									className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
										syncStatus === 'requested'
											? 'bg-green-100 text-green-700'
											: syncStatus === 'failed'
											? 'bg-red-100 text-red-700'
											: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:shadow-md'
									}`}
								>
									<svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									<span>
										{isSyncing ? 'Syncing...' : syncStatus === 'requested' ? '✓ Requested' : 'Sync'}
									</span>
								</button>
								<Link
									to={`/forums/${id}`}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-sm flex items-center gap-2"
								>
									<span>View</span>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
