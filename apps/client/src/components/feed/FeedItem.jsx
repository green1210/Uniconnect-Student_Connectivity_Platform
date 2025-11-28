import React, { useState, useEffect, useRef } from 'react';
import { getMediaUrl } from '../../lib/api.jsx';

export default function FeedItem({ id, author = 'Student User', authorName, authorUsername, authorId, authorAvatar, content = 'Sharing a study tip!', time = '2h', canDelete = false, onDelete, onEdit, mediaUrl, mediaType }) {
	const [liked, setLiked] = useState(false);
	const [saved, setSaved] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const [commentText, setCommentText] = useState('');
	const [showMenu, setShowMenu] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editedContent, setEditedContent] = useState(content || '');
	const menuRef = useRef(null);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};

		if (showMenu) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showMenu]);

	const handleLike = () => {
		setLiked(!liked);
	};

	const handleComment = () => {
		if (!commentText.trim()) return;
		console.log('Comment:', commentText);
		setCommentText('');
		setShowComments(false);
	};

	const handleSaveEdit = async () => {
		if (!editedContent.trim()) return;
		try {
			await onEdit(id, editedContent);
			setIsEditing(false);
		} catch (error) {
			console.error('Failed to edit post:', error);
			alert('Failed to update post');
		}
	};

	const handleCancelEdit = () => {
		setEditedContent(content || '');
		setIsEditing(false);
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

	return (
		<div className="bg-white border border-slate-200 rounded-sm max-w-[470px] mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between p-3">
				<div className="flex items-center gap-3">
					{authorAvatar ? (
						<img 
							src={getMediaUrl(authorAvatar)} 
							alt={authorName || author}
							className="w-8 h-8 rounded-full object-cover"
						/>
					) : (
						<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
							{getInitials(authorName || author)}
						</div>
					)}
					<div>
						<div className="text-sm font-semibold text-slate-900">
							{authorName || author}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-1 relative" ref={menuRef}>
					<button 
						onClick={() => setShowMenu(!showMenu)}
						className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
					>
						<svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
						</svg>
					</button>
					
					{/* Dropdown Menu */}
					{showMenu && (
						<div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[150px]">
							{canDelete ? (
								<>
									<button
										onClick={() => {
											setShowMenu(false);
											setIsEditing(true);
										}}
										className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
									>
										Edit
									</button>
									<button
										onClick={() => {
											setShowMenu(false);
											if (confirm('Delete this post?')) {
												onDelete && onDelete(id);
											}
										}}
										className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
									>
										Delete
									</button>
								</>
							) : (
								<>
									<button
										onClick={() => setShowMenu(false)}
										className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
									>
										Report
									</button>
									<button
										onClick={() => setShowMenu(false)}
										className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
									>
										Hide
									</button>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Media - Instagram style: full width, square for images */}
			{mediaUrl && (
				<div className="w-full bg-black">
					{mediaType === 'video' ? (
						<video 
							src={getMediaUrl(mediaUrl)} 
							controls 
							className="w-full max-h-[585px] object-contain"
						/>
					) : (
						<img 
							src={getMediaUrl(mediaUrl)} 
							alt="Post media"
							className="w-full aspect-square object-cover"
							loading="lazy"
						/>
					)}
				</div>
			)}

			{/* Action Buttons - Instagram style */}
			<div className="p-3">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-4">
						<button 
							onClick={handleLike}
							className="hover:opacity-50 transition-opacity"
						>
							{liked ? (
								<svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
								</svg>
							) : (
								<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
								</svg>
							)}
						</button>
						<button 
							onClick={() => setShowComments(!showComments)}
							className="hover:opacity-50 transition-opacity"
						>
							<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</button>
						<button className="hover:opacity-50 transition-opacity">
							<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
							</svg>
						</button>
					</div>
					<button 
						onClick={() => setSaved(!saved)}
						className="hover:opacity-50 transition-opacity"
					>
						{saved ? (
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
								<path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
							</svg>
						) : (
							<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
							</svg>
						)}
					</button>
				</div>

				{/* Like count */}
				<div className="text-sm font-semibold text-slate-900 mb-2">
					{liked ? '1 like' : '0 likes'}
				</div>

				{/* Content */}
				{isEditing ? (
					<div className="mb-3">
						<textarea
							value={editedContent}
							onChange={(e) => setEditedContent(e.target.value)}
							className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
							rows={3}
							placeholder="Edit your post..."
						/>
						<div className="flex gap-2 mt-2">
							<button
								onClick={handleSaveEdit}
								className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
							>
								Save
							</button>
							<button
								onClick={handleCancelEdit}
								className="px-4 py-1.5 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				) : (
					content && content.trim() && (
						<div className="mb-2">
							<span className="text-sm">
								<span className="font-semibold text-slate-900 mr-2">{authorName || author}</span>
								<span className="text-slate-900">{content}</span>
							</span>
						</div>
					)
				)}

				{/* Time */}
				<div className="text-xs text-slate-400 uppercase">
					{formatTime(time)} ago
				</div>
			</div>

			{/* Comment Section */}
			{showComments && (
				<div className="border-t border-slate-200 p-3">
					<div className="flex gap-3 items-center">
						<input
							type="text"
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									handleComment();
								}
							}}
							placeholder="Add a comment..."
							className="flex-1 outline-none text-sm"
						/>
						{commentText && (
							<button
								onClick={handleComment}
								className="text-blue-500 text-sm font-semibold hover:text-blue-700 transition-colors"
							>
								Post
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
