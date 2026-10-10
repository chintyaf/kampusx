import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Offcanvas, Pagination } from 'react-bootstrap';
import { Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import '@/pages/lms/lms.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Sub-components
import ExploreHeader from './explore-lms/ExploreHeader';
import FilterSidebarContent from './explore-lms/FilterSidebarContent';
import ExploreTopBar from './explore-lms/ExploreTopBar';
import ExploreGridCard from './explore-lms/ExploreGridCard';
import ExploreListCard from './explore-lms/ExploreListCard';

// Data & constants
import { MOCK_EXPLORE_ITEMS } from './explore-lms/mockData';

const ITEMS_PER_PAGE = 9;

/**
 * ExploreMicrolearningPage
 * Halaman utama eksplorasi katalog microlearning KampusX.
 */
const ExploreMicrolearningPage = () => {
	const navigate = useNavigate();

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

	// --- Bookmarks State ---
	const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set(['mod-1', 'les-1']));

	// Scroll ke atas layar setiap kali halaman berubah
	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth', // ganti 'auto' kalau mau langsung tanpa animasi smooth
		});
	}, [currentPage]);

	// --- Event Handlers (Dioptimasi dengan useCallback) ---
	const toggleBookmark = useCallback((e, id) => {
		e.stopPropagation();
		setBookmarkedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

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
			if (item.type === 'learning_path') {
				navigate(`/learner/learning-paths/${item.id}`);
			} else if (item.type === 'module') {
				navigate(`/learner/modules/${item.id}`);
			} else {
				navigate(`/learner/modules/${item.id}/forethought`);
			}
		},
		[navigate],
	);

	// --- Memoized Computations ---
	const tabCounts = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		const baseList = query
			? MOCK_EXPLORE_ITEMS.filter(
					(item) =>
						item.title.toLowerCase().includes(query) ||
						item.description.toLowerCase().includes(query) ||
						item.category.toLowerCase().includes(query),
				)
			: MOCK_EXPLORE_ITEMS;

		return {
			all: baseList.length,
			learning_path: baseList.filter((i) => i.type === 'learning_path').length,
			module: baseList.filter((i) => i.type === 'module').length,
			lesson: baseList.filter((i) => i.type === 'lesson').length,
		};
	}, [searchQuery]);

	const filteredItems = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return MOCK_EXPLORE_ITEMS.filter((item) => {
			if (activeTab !== 'all' && item.type !== activeTab) return false;

			if (query) {
				const matchesQuery =
					item.title.toLowerCase().includes(query) ||
					item.description.toLowerCase().includes(query) ||
					item.category.toLowerCase().includes(query) ||
					item.tags.some((t) => t.toLowerCase().includes(query));
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
				return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
			case 'popular':
				return list.sort((a, b) => b.enrolledCount - a.enrolledCount);
			case 'rating':
				return list.sort((a, b) => b.rating - a.rating);
			case 'duration_asc':
				return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
			case 'relevance':
			default:
				return list.sort((a, b) => {
					if (a.aiRecommended !== b.aiRecommended) {
						return a.aiRecommended ? -1 : 1;
					}
					return b.rating - a.rating;
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

		const addArrayChips = (items, keyPrefix, setter) => {
			items.forEach((item) => {
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
				label: '✨ Rekomendasi AI',
				onRemove: () => setAiRecommendedOnly(false),
			});
		}
		if (weeklyGoalOnly) {
			chips.push({
				key: 'weekly-goal',
				label: '🎯 Target Mingguan',
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
						{paginatedItems.length === 0 ? (
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
					<FilterSidebarContent {...filterSidebarProps} />
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
