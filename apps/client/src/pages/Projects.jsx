import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../lib/api.jsx';
import { useStaleCache } from '../hooks/useStaleCache.js';

export default function Projects() {
	const { user } = useUser();
	const { data, loading, refresh } = useStaleCache('projects', () => api('/projects'));
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showChatModal, setShowChatModal] = useState(false);
	const [selectedProject, setSelectedProject] = useState(null);
	const [projectMembers, setProjectMembers] = useState([]);
	const [projectMessages, setProjectMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [projectForm, setProjectForm] = useState({
		name: '',
		summary: '',
		description: '',
		tags: '',
		coverImage: '',
		category: 'other',
		status: 'recruiting',
		teamSize: 1,
		lookingFor: ''
	});
	const [isCreating, setIsCreating] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedFilter, setSelectedFilter] = useState('all');
	const [categoryFilter, setCategoryFilter] = useState('all');

	const projects = data || [];

	// Categories
	const categories = [
		{ value: 'web', label: 'Web Development', icon: '🌐' },
		{ value: 'mobile', label: 'Mobile App', icon: '📱' },
		{ value: 'ai', label: 'AI/ML', icon: '🤖' },
		{ value: 'game', label: 'Game Dev', icon: '🎮' },
		{ value: 'design', label: 'Design', icon: '🎨' },
		{ value: 'research', label: 'Research', icon: '🔬' },
		{ value: 'other', label: 'Other', icon: '📌' }
	];

	// Status options
	const statusOptions = [
		{ value: 'recruiting', label: 'Recruiting', color: 'green', icon: '🟢' },
		{ value: 'in-progress', label: 'In Progress', color: 'yellow', icon: '🟡' },
		{ value: 'completed', label: 'Completed', color: 'blue', icon: '✅' }
	];

	// Role options
	const roleOptions = ['Owner', 'Lead Developer', 'Developer', 'Designer', 'Contributor', 'Tester'];

	// Predefined cover images
	const coverImages = [
		'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
		'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop',
		'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop',
		'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&h=400&fit=crop',
		'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
		'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop'
	];

	const filteredProjects = useMemo(() => {
		let filtered = projects;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(project =>
				project.name?.toLowerCase().includes(query) ||
				project.summary?.toLowerCase().includes(query) ||
				project.tags?.toLowerCase().includes(query) ||
				project.category?.toLowerCase().includes(query)
			);
		}

		// Filter by category
		if (categoryFilter !== 'all') {
			filtered = filtered.filter(project => project.category === categoryFilter);
		}

		// Filter by type
		if (selectedFilter !== 'all') {
			if (selectedFilter === 'my') {
				filtered = filtered.filter(project => 
					project.ownerId === user?.id || project.ownerId === 'dev-user'
				);
			} else if (selectedFilter === 'joined') {
				filtered = filtered.filter(project =>
					project.members?.some(m => m.userId === user?.id)
				);
			}
		}

		return filtered;
	}, [projects, searchQuery, selectedFilter, categoryFilter, user]);

	const handleCreateProject = async (e) => {
		e.preventDefault();
		if (!projectForm.name.trim() || !projectForm.summary.trim()) {
			alert('Please fill in project name and summary');
			return;
		}

		setIsCreating(true);
		try {
			await api('/projects', {
				method: 'POST',
				body: JSON.stringify({
					name: projectForm.name,
					summary: projectForm.summary,
					description: projectForm.description,
					tags: projectForm.tags,
					category: projectForm.category,
					status: projectForm.status,
					coverImage: projectForm.coverImage || coverImages[Math.floor(Math.random() * coverImages.length)],
					teamSize: parseInt(projectForm.teamSize) || 1,
					lookingFor: projectForm.lookingFor
				})
			});
			setProjectForm({
				name: '',
				summary: '',
				description: '',
				tags: '',
				coverImage: '',
				category: 'other',
				status: 'recruiting',
				teamSize: 1,
				lookingFor: ''
			});
			setShowCreateModal(false);
			refresh();
		} catch (error) {
			console.error('Failed to create project:', error);
			alert('Failed to create project. Please try again.');
		} finally {
			setIsCreating(false);
		}
	};

	const handleJoinProject = async (projectId) => {
		try {
			await api(`/projects/${projectId}/join`, { method: 'POST' });
			refresh();
			if (selectedProject?.id === projectId) {
				loadProjectDetails(projectId);
			}
		} catch (error) {
			console.error('Failed to join project:', error);
			alert(error.message || 'Failed to join project');
		}
	};

	const handleLeaveProject = async (projectId) => {
		if (!confirm('Are you sure you want to leave this project?')) return;
		
		try {
			await api(`/projects/${projectId}/leave`, { method: 'POST' });
			refresh();
			if (selectedProject?.id === projectId) {
				loadProjectDetails(projectId);
			}
		} catch (error) {
			console.error('Failed to leave project:', error);
			alert('Failed to leave project');
		}
	};

	const loadProjectDetails = async (projectId) => {
		try {
			const [members, messages] = await Promise.all([
				api(`/projects/${projectId}/members`),
				api(`/projects/${projectId}/messages`).catch(() => [])
			]);
			setProjectMembers(members);
			setProjectMessages(messages);
		} catch (error) {
			console.error('Failed to load project details:', error);
		}
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!newMessage.trim() || !selectedProject) return;

		try {
			const message = await api(`/projects/${selectedProject.id}/messages`, {
				method: 'POST',
				body: JSON.stringify({ content: newMessage })
			});
			setProjectMessages([...projectMessages, message]);
			setNewMessage('');
		} catch (error) {
			console.error('Failed to send message:', error);
			alert('Failed to send message');
		}
	};

	const openProjectDetail = async (project) => {
		setSelectedProject(project);
		setShowDetailModal(true);
		await loadProjectDetails(project.id);
	};

	const openProjectChat = async (project) => {
		setSelectedProject(project);
		setShowChatModal(true);
		await loadProjectDetails(project.id);
	};

	const closeProjectDetail = () => {
		setShowDetailModal(false);
		setSelectedProject(null);
		setProjectMembers([]);
		setProjectMessages([]);
	};

	const closeChatModal = () => {
		setShowChatModal(false);
		setNewMessage('');
	};

	const isUserMember = (project) => {
		return project.members?.some(m => m.userId === user?.id);
	};

	const getStatusBadge = (status) => {
		const statusObj = statusOptions.find(s => s.value === status) || statusOptions[0];
		return statusObj;
	};

	const getCategoryIcon = (category) => {
		const cat = categories.find(c => c.value === category);
		return cat?.icon || '📌';
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
			{/* Animated Background */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute top-20 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
				<div className="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
				<div className="absolute bottom-20 left-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
			</div>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
								Student Projects
							</h1>
							<p className="text-slate-600">
								Collaborate, build, and showcase your work with peers
							</p>
						</div>
						<button
							onClick={() => setShowCreateModal(true)}
							className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 w-full lg:w-auto justify-center"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							Start New Project
						</button>
					</div>

					{/* Search and Filters */}
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6">
						<div className="flex flex-col lg:flex-row gap-4">
							{/* Search */}
							<div className="flex-1 relative">
								<svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
								<input
									type="text"
									placeholder="Search projects..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
								/>
							</div>

							{/* Filter Buttons */}
							<div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
								<button
									onClick={() => setSelectedFilter('all')}
									className={`px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
										selectedFilter === 'all'
											? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
											: 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
									}`}
								>
									<span className="mr-2">🌟</span>All Projects
								</button>
								<button
									onClick={() => setSelectedFilter('my')}
									className={`px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
										selectedFilter === 'my'
											? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
											: 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
									}`}
								>
									<span className="mr-2">👤</span>My Projects
								</button>
								<button
									onClick={() => setSelectedFilter('joined')}
									className={`px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
										selectedFilter === 'joined'
											? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
											: 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
									}`}
								>
									<span className="mr-2">✅</span>Joined
								</button>
							</div>
						</div>

						{/* Category Filters */}
						<div className="flex gap-2 flex-wrap mt-4">
							<button
								onClick={() => setCategoryFilter('all')}
								className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
									categoryFilter === 'all'
										? 'bg-blue-600 text-white shadow-md'
										: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
								}`}
							>
								All Categories
							</button>
							{categories.map(cat => (
								<button
									key={cat.value}
									onClick={() => setCategoryFilter(cat.value)}
									className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
										categoryFilter === cat.value
											? 'bg-blue-600 text-white shadow-md'
											: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
									}`}
								>
									<span className="mr-1.5">{cat.icon}</span>{cat.label}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="text-3xl font-bold mb-1">{projects.length}</div>
						<div className="text-blue-100">Total Projects</div>
					</div>
					<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="text-3xl font-bold mb-1">
							{projects.filter(p => p.ownerId === user?.id || p.ownerId === 'dev-user').length}
						</div>
						<div className="text-purple-100">Your Projects</div>
					</div>
					<div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
						<div className="text-3xl font-bold mb-1">{filteredProjects.length}</div>
						<div className="text-pink-100">Filtered Results</div>
					</div>
				</div>

				{/* Projects Grid */}
				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-pulse">
								<div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
								<div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
								<div className="h-4 bg-slate-200 rounded w-2/3"></div>
							</div>
						))}
					</div>
				) : filteredProjects.length === 0 ? (
					<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-12 text-center">
						<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
							<svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-slate-800 mb-2">No projects found</h3>
						<p className="text-slate-600 mb-6">
							{searchQuery ? 'Try adjusting your search' : 'Be the first to create a project!'}
						</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
						>
							Create First Project
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredProjects.map((project) => {
							const tags = project.tags ? project.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
							const coverImg = project.coverImage || coverImages[Math.floor(Math.random() * coverImages.length)];
							
							return (
								<div
									key={project.id}
									className="group bg-white rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
								>
									{/* Cover Image */}
									<div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
										<img 
											src={coverImg}
											alt={project.name}
											className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
											onError={(e) => {
												e.target.style.display = 'none';
											}}
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
										
										{/* Team Size Badge */}
										<div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
											<span className="text-sm font-semibold text-slate-700">
												{getCategoryIcon(project.category)}
											</span>
										</div>

										{/* Status Badge */}
										<div className="absolute top-4 right-4 flex gap-2">
											{(() => {
												const status = getStatusBadge(project.status);
												return (
													<div className={`bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg`}>
														<span className="text-sm">{status.icon}</span>
														<span className="text-xs font-semibold text-slate-700">{status.label}</span>
													</div>
												);
											})()}
											<div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
												<svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
													<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
												</svg>
												<span className="text-sm font-semibold text-slate-700">
													{(project._count?.members || 0) + 1}/{project.teamSize || 1}
												</span>
											</div>
										</div>
									</div>
									
									<div className="p-6">
										{/* Project Title & Description */}
										<div className="mb-4">
											<h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
												{project.name}
											</h3>
											<p className="text-slate-600 text-sm line-clamp-2 min-h-[40px]">
												{project.summary || 'No description provided'}
											</p>
										</div>

										{/* Skill Tags */}
										{tags.length > 0 && (
											<div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
												{tags.slice(0, 3).map((tag, idx) => (
													<span 
														key={idx}
														className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200"
													>
														{tag}
													</span>
												))}
												{tags.length > 3 && (
													<span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
														+{tags.length - 3}
													</span>
												)}
											</div>
										)}

										{/* Owner Info */}
										<div className="flex items-center gap-2 text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
											<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
												{project.owner?.name?.[0] || project.owner?.email?.[0]?.toUpperCase() || 'U'}
											</div>
											<div className="flex-1 min-w-0">
												<div className="font-medium text-slate-700 truncate">
													{project.owner?.name || project.owner?.email?.split('@')[0] || 'Anonymous'}
												</div>
												<div className="text-xs text-slate-500">
													{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
												</div>
											</div>
										</div>

										{/* Action Buttons */}
										<div className="flex gap-2">
											<button 
												onClick={() => openProjectDetail(project)}
												className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm flex items-center justify-center gap-2"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
												View
											</button>
											{(project.ownerId === user?.id || project.ownerId === 'dev-user') ? (
												<>
													<button 
														onClick={() => openProjectChat(project)}
														className="px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
														</svg>
													</button>
													<button className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm">
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
												</>
											) : isUserMember(project) ? (
												<>
													<button 
														onClick={() => openProjectChat(project)}
														className="px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
														</svg>
														Chat
													</button>
													<button 
														onClick={() => handleLeaveProject(project.id)}
														className="px-4 py-2.5 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors text-sm whitespace-nowrap"
													>
														Leave
													</button>
												</>
											) : (
												<button 
													onClick={() => handleJoinProject(project.id)}
													className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap flex items-center gap-1"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
													</svg>
													Join
												</button>
											)}
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Create Project Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
							<div className="flex justify-between items-center">
								<h2 className="text-2xl font-bold">Create New Project</h2>
								<button
									onClick={() => setShowCreateModal(false)}
									className="p-2 hover:bg-white/20 rounded-lg transition-colors"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						{/* Modal Body */}
						<form onSubmit={handleCreateProject} className="p-6 space-y-6">
							{/* Project Name */}
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Project Name *
								</label>
								<input
									type="text"
									value={projectForm.name}
									onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
									placeholder="e.g., AI Study Assistant"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>

							{/* Summary */}
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Short Summary *
								</label>
								<input
									type="text"
									value={projectForm.summary}
									onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })}
									placeholder="Brief one-line description"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>

							{/* Description */}
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Detailed Description
								</label>
								<textarea
									value={projectForm.description}
									onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
									placeholder="Describe your project, goals, and what you're looking for..."
									rows={4}
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								></textarea>
							</div>

							{/* Skill Tags */}
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Skill Tags *
								</label>
								<input
									type="text"
									value={projectForm.tags}
									onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
									placeholder="e.g., React, Python, Machine Learning, UI/UX"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
								<p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
							</div>

							{/* Team Size & Looking For */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Category *
									</label>
									<select
										value={projectForm.category}
										onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
										className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
									>
										{categories.map(cat => (
											<option key={cat.value} value={cat.value}>
												{cat.icon} {cat.label}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Status *
									</label>
									<select
										value={projectForm.status}
										onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
										className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
									>
										{statusOptions.map(status => (
											<option key={status.value} value={status.value}>
												{status.icon} {status.label}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Team Size & Looking For */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Team Size
									</label>
									<input
										type="number"
										min="1"
										max="50"
										value={projectForm.teamSize}
										onChange={(e) => setProjectForm({ ...projectForm, teamSize: e.target.value })}
										className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Looking For
									</label>
									<input
										type="text"
										value={projectForm.lookingFor}
										onChange={(e) => setProjectForm({ ...projectForm, lookingFor: e.target.value })}
										placeholder="e.g., Developers, Designers"
										className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
							</div>

							{/* Cover Image Selection */}
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Cover Image (Optional)
								</label>
								<div className="grid grid-cols-3 gap-3">
									{coverImages.map((img, idx) => (
										<div
											key={idx}
											onClick={() => setProjectForm({ ...projectForm, coverImage: img })}
											className={`relative h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
												projectForm.coverImage === img ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'
											}`}
										>
											<img src={img} alt={`Cover ${idx + 1}`} className="w-full h-full object-cover" />
											{projectForm.coverImage === img && (
												<div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
													<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
													</svg>
												</div>
											)}
										</div>
									))}
								</div>
								<p className="text-xs text-slate-500 mt-2">Random image selected if none chosen</p>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => setShowCreateModal(false)}
									className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isCreating}
									className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								>
									{isCreating ? 'Creating...' : 'Create Project'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Project Detail Modal */}
			{showDetailModal && selectedProject && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
					<div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
						{/* Cover Image Header */}
						<div className="relative h-64 overflow-hidden rounded-t-2xl">
							<img 
								src={selectedProject.coverImage || coverImages[0]}
								alt={selectedProject.name}
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.style.display = 'none';
								}}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
							
							{/* Close Button */}
							<button
								onClick={closeProjectDetail}
								className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg transition-colors"
							>
								<svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>

							{/* Project Title Overlay */}
							<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
								<h2 className="text-3xl font-bold mb-2">{selectedProject.name}</h2>
								<p className="text-white/90 text-lg">{selectedProject.summary}</p>
							</div>
						</div>

						<div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
							{/* Owner & Stats */}
							<div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
										{selectedProject.owner?.name?.[0] || selectedProject.owner?.email?.[0]?.toUpperCase() || 'U'}
									</div>
									<div>
										<div className="font-semibold text-slate-800">
											{selectedProject.owner?.name || selectedProject.owner?.email?.split('@')[0] || 'Anonymous'}
										</div>
										<div className="text-sm text-slate-500">Project Owner</div>
										{selectedProject.owner?.email && (
											<div className="text-xs text-blue-600 mt-0.5">
												{selectedProject.owner.email}
											</div>
										)}
									</div>
								</div>

								<div className="flex gap-4">
									<div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
										<div className="text-2xl font-bold text-blue-600">{selectedProject.teamSize || 1}</div>
										<div className="text-xs text-slate-600">Team Members</div>
									</div>
									<div className="text-center px-4 py-2 bg-purple-50 rounded-lg">
										<div className="text-2xl font-bold text-purple-600">
											{new Date(selectedProject.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
										</div>
										<div className="text-xs text-slate-600">Created</div>
									</div>
								</div>
							</div>

							{/* Skill Tags */}
							{selectedProject.tags && (
								<div>
									<h3 className="text-lg font-bold text-slate-800 mb-3">Required Skills</h3>
									<div className="flex flex-wrap gap-2">
										{selectedProject.tags.split(',').map((tag, idx) => (
											<span 
												key={idx}
												className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold rounded-full border border-blue-200"
											>
												{tag.trim()}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Overview */}
							<div>
								<h3 className="text-lg font-bold text-slate-800 mb-3">Project Overview</h3>
								<p className="text-slate-600 leading-relaxed">
									{selectedProject.description || selectedProject.summary || 'No detailed description available yet.'}
								</p>
							</div>

							{/* Goals */}
							<div>
								<h3 className="text-lg font-bold text-slate-800 mb-3">Project Goals</h3>
								<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
									<ul className="space-y-2 text-slate-700">
										<li className="flex items-start gap-2">
											<svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
											<span>Build a functional prototype</span>
										</li>
										<li className="flex items-start gap-2">
											<svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
											<span>Collaborate with talented team members</span>
										</li>
										<li className="flex items-start gap-2">
											<svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
											<span>Launch and gather user feedback</span>
										</li>
									</ul>
								</div>
							</div>

							{/* Looking For */}
							{selectedProject.lookingFor && (
								<div>
									<h3 className="text-lg font-bold text-slate-800 mb-3">Looking For</h3>
									<div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
										<svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
										</svg>
										<span className="text-green-800 font-semibold">{selectedProject.lookingFor}</span>
									</div>
								</div>
							)}

							{/* Team Members List */}
							<div>
								<h3 className="text-lg font-bold text-slate-800 mb-3">
									Team Members ({(projectMembers.length || 0) + 1}/{selectedProject.teamSize})
								</h3>
								<div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 max-h-64 overflow-y-auto">
									{/* Owner */}
									<div className="flex items-center gap-3 p-3 bg-white rounded-lg">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
											{selectedProject.owner?.name?.[0] || 'U'}
										</div>
										<div className="flex-1">
											<div className="font-semibold text-slate-800">{selectedProject.owner?.name || 'Owner'}</div>
											<div className="text-xs text-slate-500">Project Owner</div>
										</div>
										<span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Owner</span>
									</div>
									
									{/* Members */}
									{projectMembers.map((member) => (
										<div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
											{member.user?.avatar ? (
												<img 
													src={member.user.avatar} 
													alt={member.user.name}
													className="w-10 h-10 rounded-full object-cover"
												/>
											) : (
												<div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
													{member.user?.name?.[0] || member.user?.email?.[0]?.toUpperCase() || 'M'}
												</div>
											)}
											<div className="flex-1">
												<div className="font-semibold text-slate-800">{member.user?.name || member.user?.email?.split('@')[0]}</div>
												<div className="text-xs text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
											</div>
											<span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full capitalize">
												{member.role || 'Member'}
											</span>
										</div>
									))}

									{projectMembers.length === 0 && (
										<div className="text-center py-4 text-slate-500 text-sm">
											No team members yet. Be the first to join!
										</div>
									)}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-3 pt-4">
								<button
									onClick={closeProjectDetail}
									className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
								>
									Close
								</button>
								
								{/* Contact Owner Button - Always visible for non-owners */}
								{selectedProject.ownerId !== user?.id && selectedProject.ownerId !== 'dev-user' && selectedProject.owner?.email && (
									<a
										href={`mailto:${selectedProject.owner.email}?subject=Interested in ${selectedProject.name}&body=Hi ${selectedProject.owner.name || 'there'},%0D%0A%0D%0AI'm interested in learning more about your project "${selectedProject.name}".%0D%0A%0D%0A`}
										className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
										Contact Owner
									</a>
								)}
								
								{(selectedProject.ownerId === user?.id || selectedProject.ownerId === 'dev-user') ? (
									<>
										<button 
											onClick={() => openProjectChat(selectedProject)}
											className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
											</svg>
											Open Chat
										</button>
										<button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
											Edit Project
										</button>
									</>
								) : isUserMember(selectedProject) ? (
									<>
										<button 
											onClick={() => openProjectChat(selectedProject)}
											className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
											</svg>
											Open Chat
										</button>
										<button 
											onClick={() => handleLeaveProject(selectedProject.id)}
											className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700 transition-all"
										>
											Leave Project
										</button>
									</>
								) : (
									<button 
										onClick={() => handleJoinProject(selectedProject.id)}
										className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
										Join Project
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Chat Modal */}
			{showChatModal && selectedProject && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col">
						{/* Chat Header */}
						<div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold">{selectedProject.name}</h2>
								<p className="text-white/90 text-sm">Team Discussion</p>
							</div>
							<button
								onClick={closeChatModal}
								className="p-2 hover:bg-white/20 rounded-lg transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Messages Area */}
						<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
							{projectMessages.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-full text-slate-500">
									<svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
									<p className="font-medium">No messages yet</p>
									<p className="text-sm">Start the conversation!</p>
								</div>
							) : (
								projectMessages.map((msg) => (
									<div 
										key={msg.id} 
										className={`flex gap-3 ${msg.senderId === user?.id ? 'flex-row-reverse' : ''}`}
									>
										<div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${
											msg.senderId === selectedProject.ownerId 
												? 'bg-gradient-to-br from-blue-400 to-purple-500'
												: 'bg-gradient-to-br from-green-400 to-teal-500'
										}`}>
											{msg.sender?.name?.[0] || 'U'}
										</div>
										<div className={`flex-1 max-w-md ${msg.senderId === user?.id ? 'items-end' : ''}`}>
											<div className="flex items-center gap-2 mb-1">
												<span className="text-sm font-semibold text-slate-700">
													{msg.sender?.name || msg.sender?.email?.split('@')[0]}
												</span>
												<span className="text-xs text-slate-500">
													{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
												</span>
											</div>
											<div className={`p-3 rounded-lg ${
												msg.senderId === user?.id 
													? 'bg-blue-600 text-white rounded-br-none'
													: 'bg-white text-slate-800 rounded-bl-none shadow-sm'
											}`}>
												{msg.content}
											</div>
										</div>
									</div>
								))
							)}
						</div>

						{/* Message Input */}
						<form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
							<div className="flex gap-3">
								<input
									type="text"
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									placeholder="Type your message..."
									className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
								<button
									type="submit"
									disabled={!newMessage.trim()}
									className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
									</svg>
									Send
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
