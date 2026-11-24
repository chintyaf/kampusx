import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Offcanvas, Pagination, Spinner } from 'react-bootstrap';
import { Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';

import '@/pages/lms/lms.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Sub-components
import ExploreHeader from './explore-lms/ExploreHeader';
import FilterSidebarContent from './explore-lms/FilterSidebarContent';
import ExploreTopBar from './explore-lms/ExploreTopBar';
import ExploreGridCard from './explore-lms/ExploreGridCard';
import ExploreListCard from './explore-lms/ExploreListCard';

const ITEMS_PER_PAGE = 9;

/**
 * ExploreMicrolearningPage
 * Halaman utama eksplorasi katalog microlearning KampusX.
 *
 * Endpoint yang dipakai:
 * - GET    /lms/explore                    -> katalog + opsi filter (item boleh punya field `isBookmarked`)
 * - POST   /lms/bookmarks                  -> body: { type, id }
 * - DELETE /lms/bookmarks/:type/:id
 * (Sesuaikan path bookmark dengan route backend kamu.)
 */
const ExploreMicrolearningPage = () => {
	const navigate = useNavigate();

	// --- API Items & Loading State ---
	const [items, setItems] = useState([]);
	const [apiFilters, setApiFilters] = useState(null);
	const [loading, setLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);

	// --- Search & Tab States ---
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState('all');

	// --- Sidebar Filter States ---
	const [selectedTopics, setSelectedTopics] = useState([]);
	const [selectedLevels, setSelectedLevels] = useState([]);
	const [selectedDurations, setSelectedDurations] = useState([]);
	const [selectedMedia, setSelectedMedia] = useState([]);
	const [aiRecommendedOnly, setAiRecommendedOnly] = useState(false);
	const [weeklyGoalOnly, setWeeklyGoalOnly] = useState(false);

	// --- Display & Pagination States ---
	const [sortBy, setSortBy] = useState('relevance');
	const [viewMode, setViewMode] = useState('grid');
	const [currentPage, setCurrentPage] = useState(1);
	const [showMobileFilter, setShowMobileFilter] = useState(false);

	// --- Bookmarks State (diisi dari API) ---
	const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set());
	const bookmarkedIdsRef = useRef(bookmarkedIds);
	const pendingBookmarksRef = useRef(new Set()); // cegah klik ganda saat request berjalan

	useEffect(() => {
		bookmarkedIdsRef.current = bookmarkedIds;
	}, [bookmarkedIds]);

	// Fetch data katalog explore dari backend API
	const fetchExploreCatalog = useCallback(async (isMountedRef) => {
		setLoading(true);
		setFetchError(null);

		try {
			const response = await api.get('/lms/explore');

			if (isMountedRef && !isMountedRef.current) return;

			if (response?.data?.success) {
				if (Array.isArray(response.data.data)) {
					const data = response.data.data;
					setItems(data);
					// Status bookmark berasal dari backend (field: isBookmarked)
					setBookmarkedIds(new Set(data.filter((i) => i.isBookmarked).map((i) => i.id)));
				}
				if (response.data.filters) {
					setApiFilters(response.data.filters);
				}
			} else {
				setFetchError('Katalog tidak dapat dimuat. Silakan coba lagi.');
			}
		} catch (error) {
			console.error('Gagal memuat katalog explore dari API:', error);
			if (!isMountedRef || isMountedRef.current) {
				setFetchError('Gagal memuat katalog. Periksa koneksi lalu coba lagi.');
			}
		} finally {
			if (!isMountedRef || isMountedRef.current) {
				setLoading(false);
			}
		}
	}, []);

	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		fetchExploreCatalog(isMountedRef);

		return () => {
			isMountedRef.current = false;
		};
	}, [fetchExploreCatalog]);

	// Scroll ke atas layar setiap kali halaman berubah
	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	}, [currentPage]);

	// --- Event Handlers (Dioptimasi dengan useCallback) ---
	const toggleBookmark = useCallback(
		async (e, id) => {
			e?.stopPropagation?.();

			if (pendingBookmarksRef.current.has(id)) return;

			const item = items.find((i) => i.id === id);
			if (!item) return;

			const targetId = item.rawId || id;
			const wasBookmarked = bookmarkedIdsRef.current.has(id);

			pendingBookmarksRef.current.add(id);

			// Optimistic update: UI langsung berubah
			setBookmarkedIds((prev) => {
				const next = new Set(prev);
				if (wasBookmarked) {
					next.delete(id);
				} else {
					next.add(id);
				}
				return next;
			});

			try {
				if (wasBookmarked) {
					await api.delete(`/lms/bookmarks/${item.type}/${targetId}`);
				} else {
					await api.post('/lms/bookmarks', { type: item.type, id: targetId });
				}
			} catch (error) {
				console.error('Gagal memperbarui bookmark:', error);

				// Rollback jika request gagal
				if (isMountedRef.current) {
					setBookmarkedIds((prev) => {
						const next = new Set(prev);
						if (wasBookmarked) {
							next.add(id);
						} else {
							next.delete(id);
						}
						return next;
					});
				}
			} finally {
				pendingBookmarksRef.current.delete(id);
			}
		},
		[items],
	);

	const toggleArrayItem = useCallback((setter, item) => {
		setter((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
		setCurrentPage(1);
	}, []);

	const handleResetFilters = useCallback(() => {
		setSearchQuery('');
		setActiveTab('all');
		setSelectedTopics([]);
		setSelectedLevels([]);
		setSelectedDurations([]);
		setSelectedMedia([]);
		setAiRecommendedOnly(false);
		setWeeklyGoalOnly(false);
		setSortBy('relevance');
		setCurrentPage(1);
	}, []);

	const handleNavigateItem = useCallback(
		(item) => {
			const targetId = item.rawId || item.id;

			const learningPathSlug =
				item.type === 'learning_path'
					? item.slug || targetId
					: item.learningPathSlug || item.learning_path_slug || item.pathSlug;

			if (item.type === 'learning_path') {
				navigate(`/learner/learning-paths/${learningPathSlug}`);
			} else if (item.type === 'module') {
				if (learningPathSlug) {
					navigate(`/learner/learning-paths/${learningPathSlug}/modules/${targetId}`);
				} else {
					navigate(`/learner/modules/${targetId}`);
				}
			} else {
				const moduleId = item.moduleId || item.module_id || item.rawModuleId;

				if (learningPathSlug && moduleId) {
					navigate(
						`/learner/learning-paths/${learningPathSlug}/modules/${moduleId}/lessons/${targetId}`,
					);
				} else {
					navigate(`/learner/lessons/${targetId}`);
				}
			}
		},
		[navigate],
	);

	// --- Memoized Computations ---
	const tabCounts = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		const baseList = query
			? items.filter(
					(item) =>
						item.title.toLowerCase().includes(query) ||
						(item.description && item.description.toLowerCase().includes(query)) ||
						(item.category && item.category.toLowerCase().includes(query)),
				)
			: items;

		return {
			all: baseList.length,
			learning_path: baseList.filter((i) => i.type === 'learning_path').length,
			module: baseList.filter((i) => i.type === 'module').length,
			lesson: baseList.filter((i) => i.type === 'lesson').length,
		};
	}, [searchQuery, items]);

	const filteredItems = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return items.filter((item) => {
			if (activeTab !== 'all' && item.type !== activeTab) return false;

			if (query) {
				const matchesQuery =
					item.title.toLowerCase().includes(query) ||
					(item.description && item.description.toLowerCase().includes(query)) ||
					(item.category && item.category.toLowerCase().includes(query)) ||
					(Array.isArray(item.tags) &&
						item.tags.some((t) => t.toLowerCase().includes(query)));
				if (!matchesQuery) return false;
			}

			if (selectedTopics.length > 0 && !selectedTopics.includes(item.category)) return false;
			if (selectedLevels.length > 0 && !selectedLevels.includes(item.level)) return false;
			if (selectedDurations.length > 0 && !selectedDurations.includes(item.durationRange))
				return false;
			if (selectedMedia.length > 0 && !selectedMedia.includes(item.mediaType)) return false;
			if (aiRecommendedOnly && !item.aiRecommended) return false;
			if (weeklyGoalOnly && !item.supportsWeeklyGoal) return false;

			return true;
		});
	}, [
		items,
		searchQuery,
		activeTab,
		selectedTopics,
		selectedLevels,
		selectedDurations,
		selectedMedia,
		aiRecommendedOnly,
		weeklyGoalOnly,
	]);

	const sortedItems = useMemo(() => {
		const list = [...filteredItems];
		switch (sortBy) {
			case 'newest':
				return list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
			case 'popular':
				return list.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
			case 'rating':
				return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
			case 'duration_asc':
				return list.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
			case 'relevance':
			default:
				return list.sort((a, b) => {
					if (a.aiRecommended !== b.aiRecommended) {
						return a.aiRecommended ? -1 : 1;
					}
					return (b.rating || 0) - (a.rating || 0);
				});
		}
	}, [filteredItems, sortBy]);

	const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE) || 1;

	const paginatedItems = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return sortedItems.slice(start, start + ITEMS_PER_PAGE);
	}, [sortedItems, currentPage]);

	const activeChips = useMemo(() => {
		const chips = [];

		const addArrayChips = (categoryItems, keyPrefix, setter) => {
			categoryItems.forEach((item) => {
				chips.push({
					key: `${keyPrefix}-${item}`,
					label: item,
					onRemove: () => toggleArrayItem(setter, item),
				});
			});
		};

		addArrayChips(selectedTopics, 'topic', setSelectedTopics);
		addArrayChips(selectedLevels, 'level', setSelectedLevels);
		addArrayChips(selectedDurations, 'dur', setSelectedDurations);
		addArrayChips(selectedMedia, 'med', setSelectedMedia);

		if (aiRecommendedOnly) {
			chips.push({
				key: 'ai-rec',
				label: 'Rekomendasi AI',
				onRemove: () => setAiRecommendedOnly(false),
			});
		}
		if (weeklyGoalOnly) {
			chips.push({
				key: 'weekly-goal',
				label: 'Target Mingguan',
				onRemove: () => setWeeklyGoalOnly(false),
			});
		}

		return chips;
	}, [
		selectedTopics,
		selectedLevels,
		selectedDurations,
		selectedMedia,
		aiRecommendedOnly,
		weeklyGoalOnly,
		toggleArrayItem,
	]);

	const filterSidebarProps = useMemo(
		() => ({
			activeChips,
			selectedTopics,
			selectedLevels,
			selectedDurations,
			selectedMedia,
			aiRecommendedOnly,
			weeklyGoalOnly,
			setSelectedTopics,
			setSelectedLevels,
			setSelectedDurations,
			setSelectedMedia,
			setAiRecommendedOnly,
			setWeeklyGoalOnly,
			setCurrentPage,
			handleResetFilters,
			toggleArrayItem,
			topicOptions: apiFilters?.topics || [],
			levelOptions: apiFilters?.levels || [],
			durationOptions: apiFilters?.durations || [],
			mediaOptions: apiFilters?.media || [],
		}),
		[
			activeChips,
			selectedTopics,
			selectedLevels,
			selectedDurations,
			selectedMedia,
			aiRecommendedOnly,
			weeklyGoalOnly,
			handleResetFilters,
			toggleArrayItem,
			apiFilters,
		],
	);

	return (
		<div className="explore-page-wrapper">
			<Container>
				{/* 1. HEADER & SEARCH SECTION */}
				<ExploreHeader
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					tabCounts={tabCounts}
					activeChips={activeChips}
					setCurrentPage={setCurrentPage}
					setShowMobileFilter={setShowMobileFilter}
					sortedItems={sortedItems}
					sortBy={sortBy}
					setSortBy={setSortBy}
					viewMode={viewMode}
					setViewMode={setViewMode}
				/>

				{/* 2. LAYOUT DUA KOLOM */}
				<Row className="g-4">
					{/* Sidebar Filter (Desktop) */}
					<Col lg={3} className="d-none d-lg-block align-self-start">
						<Card className="border-0 shadow-sm p-4 explore-sidebar-card">
							<FilterSidebarContent {...filterSidebarProps} />
						</Card>
					</Col>

					{/* Top Results Bar & Grid/List Catalog */}
					<Col lg={9}>
						<ExploreTopBar
							activeChips={activeChips}
							handleResetFilters={handleResetFilters}
						/>

						{/* 3. KATALOG HASIL PENCARIAN */}
						{fetchError && items.length === 0 ? (
							<Card className="border-0 shadow-sm text-center p-5 my-3 bg-white explore-sidebar-card">
								<h4 className="fw-bold text-dark mb-2">Katalog gagal dimuat</h4>
								<p
									className="text-muted mx-auto mb-4"
									style={{ maxWidth: '440px', fontSize: '0.9rem' }}
								>
									{fetchError}
								</p>
								<div>
									<Button
										variant="primary"
										className="fw-semibold px-4 py-2 rounded-3 shadow-sm btn-lms-primary"
										onClick={() => fetchExploreCatalog(isMountedRef)}
									>
										Coba Lagi
									</Button>
								</div>
							</Card>
						) : loading && items.length === 0 ? (
							<Card className="border-0 shadow-sm text-center p-5 my-3 bg-white explore-sidebar-card">
								<div className="py-5">
									<Spinner animation="border" variant="primary" role="status" />
									<p className="mt-3 text-muted">
										Memuat katalog materi pembelajaran...
									</p>
								</div>
							</Card>
						) : paginatedItems.length === 0 ? (
							<Card className="border-0 shadow-sm text-center p-5 my-3 bg-white explore-sidebar-card">
								<div className="explore-empty-icon mb-3">
									<Search size={32} />
								</div>
								<h4 className="fw-bold text-dark mb-2">
									Tidak ada materi yang cocok
								</h4>
								<p
									className="text-muted mx-auto mb-4"
									style={{ maxWidth: '440px', fontSize: '0.9rem' }}
								>
									Coba sesuaikan kata kunci pencarian Anda atau hapus beberapa
									filter untuk menemukan konten pembelajaran lainnya.
								</p>
								<div>
									<Button
										variant="primary"
										className="fw-semibold px-4 py-2 rounded-3 shadow-sm btn-lms-primary"
										onClick={handleResetFilters}
									>
										Reset Semua Filter
									</Button>
								</div>
							</Card>
						) : viewMode === 'grid' ? (
							<Row className="row-cols-1 row-cols-md-2 row-cols-xl-3 g-3 mb-4">
								{paginatedItems.map((item) => (
									<Col key={item.id} className="d-flex">
										<ExploreGridCard
											item={item}
											isBookmarked={bookmarkedIds.has(item.id)}
											onToggleBookmark={toggleBookmark}
											onNavigate={handleNavigateItem}
										/>
									</Col>
								))}
							</Row>
						) : (
							<div className="d-flex flex-column gap-3 mb-4">
								{paginatedItems.map((item) => (
									<ExploreListCard
										key={item.id}
										item={item}
										isBookmarked={bookmarkedIds.has(item.id)}
										onToggleBookmark={toggleBookmark}
										onNavigate={handleNavigateItem}
									/>
								))}
							</div>
						)}

						{/* 4. PAGINATION */}
						{totalPages > 1 && (
							<div className="d-flex align-items-center justify-content-between flex-wrap gap-3 pt-3 border-top border-light-subtle">
								<div className="pagination-info text-muted">
									Halaman{' '}
									<span className="fw-semibold text-dark">{currentPage}</span>{' '}
									dari <span className="fw-semibold text-dark">{totalPages}</span>{' '}
									<span className="text-secondary opacity-75">
										({sortedItems.length} total materi)
									</span>
								</div>

								<Pagination className="custom-pagination mb-0">
									<Pagination.Prev
										disabled={currentPage === 1}
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									/>

									{Array.from({ length: totalPages }, (_, i) => i + 1).map(
										(page) => (
											<Pagination.Item
												key={page}
												active={page === currentPage}
												onClick={() => setCurrentPage(page)}
											>
												{page}
											</Pagination.Item>
										),
									)}

									<Pagination.Next
										disabled={currentPage === totalPages}
										onClick={() =>
											setCurrentPage((p) => Math.min(totalPages, p + 1))
										}
									/>
								</Pagination>
							</div>
						)}
					</Col>
				</Row>
			</Container>

			{/* MOBILE OFFCANVAS FILTER DRAWER */}
			<Offcanvas
				show={showMobileFilter}
				onHide={() => setShowMobileFilter(false)}
				placement="start"
				style={{ width: '310px' }}
			>
				<Offcanvas.Header closeButton className="border-bottom">
					<Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
						<Filter size={18} className="text-primary" />
						<span>Filter Microlearning</span>
					</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body className="p-3" style={{ overflowY: 'auto' }}>
					<FilterSidebarContent {...filterSidebarProps} idPrefix="mobile" />
					<div className="mt-4 pt-3 border-top">
						<Button
							variant="primary"
							className="w-100 fw-bold py-2 rounded-3 btn-lms-primary"
							onClick={() => setShowMobileFilter(false)}
						>
							Terapkan Filter ({sortedItems.length})
						</Button>
					</div>
				</Offcanvas.Body>
			</Offcanvas>
		</div>
	);
};

export default ExploreMicrolearningPage;
