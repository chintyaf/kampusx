import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '@/api/axios';
import LearningPathCard from './manage-micro/LearningPathCard';

const OrgMicrolearning = () => {
	const [learningPaths, setLearningPaths] = useState([]);
	const [filterStatus, setFilterStatus] = useState('All');
	const [viewType, setViewType] = useState('Grid');
	const [searchQuery, setSearchQuery] = useState('');

	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	// Mengambil data Learning Path dari API
	useEffect(() => {
		let isMounted = true;

		const fetchLearningPaths = async () => {
			setIsLoading(true);
			setErrorMessage('');

			try {
				const response = await api.get(`organizer/lms/learning-paths`);
				const result = response.data;
				console.log(result);

				// Mendukung response Laravel biasa maupun pagination
				const rawData = result.data.data;
				if (!Array.isArray(rawData)) {
					throw new Error('Format response Learning Path tidak valid.');
				}

				const mappedData = rawData.map((item) => {
					const moduleCount = item.modules_count ?? item.modules?.length ?? 0;

					const enrolledCount =
						item.enrollments_count ??
						item.students_count ??
						item.enrollments?.length ??
						0;

					const eventName =
						item.event?.title ?? item.event?.name ?? 'No event associated';

					return {
						id: item.id,
						title: item.title,
						event: eventName,

						status: item.status?.charAt(0).toUpperCase() + item.status?.slice(1),

						completion: item.completion ?? 0,
						modules: moduleCount,

						enrolled: `${Number(enrolledCount).toLocaleString('id-ID')} enrolled`,

						thumbnail: item.thumbnail_url ?? item.thumbnail ?? null,

						categories: Array.isArray(item.categories)
							? item.categories
							: item.category
								? [item.category]
								: [],

						updatedAt: item.updated_at
							? new Date(item.updated_at).toLocaleDateString('id-ID', {
									day: 'numeric',
									month: 'short',
									year: 'numeric',
								})
							: 'Not available',

						originalData: item,
					};
				});

				if (isMounted) {
					setLearningPaths(mappedData);
				}
			} catch (error) {
				console.error('Gagal mengambil data Learning Path:', error);

				if (isMounted) {
					setErrorMessage(
						error.response?.data?.message ||
							error.message ||
							'Gagal mengambil data Learning Path.',
					);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		fetchLearningPaths();

		return () => {
			isMounted = false;
		};
	}, []);

	// Filter berdasarkan status dan pencarian
	const filteredLearningPaths = useMemo(() => {
		return learningPaths.filter((item) => {
			const matchesStatus =
				filterStatus === 'All' || item.status?.toLowerCase() === filterStatus.toLowerCase();

			const keyword = searchQuery.toLowerCase();

			const matchesSearch =
				item.title?.toLowerCase().includes(keyword) ||
				item.event?.toLowerCase().includes(keyword);

			return matchesStatus && matchesSearch;
		});
	}, [learningPaths, filterStatus, searchQuery]);

	return (
		<div
			style={{
				fontFamily: 'var(--font)',
				backgroundColor: 'var(--color-bg)',
				color: 'var(--color-text)',
				minHeight: '100vh',
				padding: '36px 48px',
			}}
		>
			<div>
				{/* Header Section */}
				<div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
					<div>
						<h2
							style={{
								fontSize: 'var(--font-xl)',
								fontWeight: '700',
								color: 'var(--text)',
								margin: 0,
							}}
						>
							Manage Learning Paths
						</h2>

						<p
							style={{
								fontSize: 'var(--font-sm)',
								color: 'var(--text-muted)',
								margin: '4px 0 0 0',
							}}
						>
							Create and manage structured learning experiences
						</p>
					</div>

					<Link
						to="/organizer/learning-path/add"
						style={{
							backgroundColor: 'var(--primary)',
							color: 'var(--color-white)',
							border: 'none',
							borderRadius: 'var(--radius-md)',
							padding: '10px 20px',
							fontSize: 'var(--font-sm)',
							fontWeight: '600',
							display: 'inline-flex',
							alignItems: 'center',
							gap: '8px',
							cursor: 'pointer',
							boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
							textDecoration: 'none',
						}}
					>
						<Plus size={18} />
						Create New Path
					</Link>
				</div>

				{/* Search & Filter Bar */}
				<div className="row g-3 mb-4 align-items-center">
					{/* Search */}
					<div className="col-12 col-md-9 col-lg-9">
						<input
							type="text"
							placeholder="Search by event or topic..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							style={{
								width: '100%',
								padding: '10px 16px',
								fontSize: 'var(--font-sm)',
								borderRadius: 'var(--radius)',
								border: '1px solid var(--neutral-border)',
								backgroundColor: 'var(--card)',
								color: 'var(--text)',
								outline: 'none',
							}}
						/>
					</div>

					{/* Status Filter */}
					<div className="col-12 col-md-3 col-lg-3 d-flex justify-content-md-end">
						<div
							style={{
								backgroundColor: 'var(--card)',
								padding: '4px',
								borderRadius: 'var(--radius)',
								border: '1px solid var(--neutral-border)',
								display: 'inline-flex',
								gap: '4px',
								width: '100%',
								justifyContent: 'space-between',
							}}
						>
							{['All', 'Published', 'Draft'].map((status) => {
								const isActive = filterStatus === status;

								return (
									<button
										key={status}
										onClick={() => setFilterStatus(status)}
										style={{
											flex: 1,
											border: 'none',
											borderRadius: 'var(--radius-sm)',
											padding: '6px 12px',
											fontSize: 'var(--font-xs)',
											fontWeight: isActive ? '600' : '500',
											backgroundColor: isActive
												? 'var(--primary-light)'
												: 'transparent',
											color: isActive
												? 'var(--primary)'
												: 'var(--text-muted)',
											cursor: 'pointer',
											transition: 'all 0.2s',
										}}
									>
										{status}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="text-center py-5">
						<div
							className="spinner-border"
							style={{ color: 'var(--primary)' }}
							role="status"
						/>
						<p className="mt-3 text-muted">Loading Learning Paths...</p>
					</div>
				)}

				{/* Error State */}
				{!isLoading && errorMessage && (
					<div className="alert alert-danger d-flex justify-content-between align-items-center">
						<span>{errorMessage}</span>

						<button
							className="btn btn-sm btn-outline-danger"
							onClick={() => window.location.reload()}
						>
							Retry
						</button>
					</div>
				)}

				{/* Cards Grid */}
				{!isLoading && !errorMessage && (
					<>
						{filteredLearningPaths.length > 0 ? (
							<div className="row g-4">
								{filteredLearningPaths.map((item) => (
									<LearningPathCard data={item} key={item.id} />
								))}
							</div>
						) : (
							<div className="text-center py-5">
								<h5
									style={{
										color: 'var(--text)',
										fontWeight: '600',
									}}
								>
									No Learning Paths Found
								</h5>

								<p
									style={{
										color: 'var(--text-muted)',
										fontSize: 'var(--font-sm)',
									}}
								>
									{searchQuery || filterStatus !== 'All'
										? 'Try changing your search or filter.'
										: 'Start by creating your first Learning Path.'}
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default OrgMicrolearning;
