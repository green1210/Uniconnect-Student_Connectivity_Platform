import React, { useState } from 'react';

/**
 * Instagram-style Post Grid Component
 * 
 * Features:
 * - Responsive grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
 * - Perfect square aspect ratio (1:1) using aspect-square
 * - Hover effects: image zoom + dark overlay
 * 
 * @param {Object} props
 * @param {Array} props.posts - Array of post objects with at least { image, id }
 * @param {Function} props.onPostClick - Optional callback when post is clicked
 */
export default function PostGrid({ posts = [], onPostClick }) {
	const [hoveredPostId, setHoveredPostId] = useState(null);

	if (!posts || posts.length === 0) {
		return (
			<div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200">
				<div className="text-6xl mb-4">📸</div>
				<p className="text-slate-800 font-semibold text-lg mb-2">No posts to display</p>
				<p className="text-slate-500">Posts with images will appear here</p>
			</div>
		);
	}

	const handlePostClick = (post) => {
		if (onPostClick) {
			onPostClick(post);
		}
	};

	return (
		<div className="w-full">
			{/* Grid Container - 3 cols desktop, 2 tablet, 1 mobile */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 md:gap-3">
				{posts.map((post) => {
					// Extract image URL - handle different possible field names
					const imageUrl = post.mediaUrl || post.image || post.imageUrl || post.url;

					return (
						<div
							key={post.id}
							className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer group"
							onMouseEnter={() => setHoveredPostId(post.id)}
							onMouseLeave={() => setHoveredPostId(null)}
							onClick={() => handlePostClick(post)}
						>
							{/* Image with zoom effect */}
							<img
								src={imageUrl}
								alt={post.content || post.caption || 'Post image'}
								className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
								loading="lazy"
							/>

							{/* Dark overlay on hover */}
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 ease-out" />

							{/* Optional: Video indicator */}
							{(post.mediaType === 'video' || post.type === 'video') && (
								<div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full p-2 z-20">
									<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
										<path d="M8 5v14l11-7z"/>
									</svg>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

/**
 * USAGE EXAMPLE:
 * 
 * import PostGrid from '../components/feed/PostGrid';
 * 
 * function MyComponent() {
 *   const posts = [
 *     { id: 1, mediaUrl: 'https://...', content: 'Beautiful sunset' },
 *     { id: 2, mediaUrl: 'https://...', content: 'City skyline' },
 *   ];
 * 
 *   const handlePostClick = (post) => {
 *     console.log('Clicked post:', post);
 *   };
 * 
 *   return (
 *     <PostGrid 
 *       posts={posts} 
 *       onPostClick={handlePostClick}
 *     />
 *   );
 * }
 */
