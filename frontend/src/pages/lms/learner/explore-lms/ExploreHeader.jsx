import React from 'react';
import { Button, InputGroup, Form, Row, Col } from 'react-bootstrap';
import { Search, SlidersHorizontal, Compass, Layers, Zap, X, LayoutGrid, List } from 'lucide-react';

/**
 * ExploreHeader
 * Bagian header halaman: judul & deskripsi di kiri, search bar & filter mobile di kanan,
 * serta tab navigasi kategori di bawahnya.
 */
const ExploreHeader = ({
	searchQuery,
	setSearchQuery,
	activeTab,
	setActiveTab,
	tabCounts,
	activeChips,
	setCurrentPage,
	setShowMobileFilter,
	sortedItems = [],
	sortBy = 'relevance',
	setSortBy = () => {},
	viewMode = 'grid',
	setViewMode = () => {},
}) => (
	<div className="mb-4 explore-header-wrapper">
		{/* 1. ROW HEADER: Judul (Kiri) + Search Bar (Kanan) */}
		<Row className="align-items-center g-3 mb-3">
			<Col xs={12} md={6} lg={6}>
				<h1 className="fw-bold text-dark mb-1 explore-page-title fs-2">Eksplor Kelas</h1>
				<p className="text-muted mb-0 explore-page-desc">
					Akses materi pembelajaran ringkas, modular, dan terarah sesuai ritme belajarmu.
				</p>
			</Col>

			<Col xs={12} md={6} lg={6}>
				<div className="d-flex align-items-center gap-2">
					{/* Clean White Search Bar */}
					<InputGroup className="bg-white border rounded-3 overflow-hidden flex-grow-1 align-items-center explore-search-bar">
						<InputGroup.Text className="bg-white border-0 ps-3 pe-2 text-muted">
							<Search size={16} />
						</InputGroup.Text>

						<Form.Control
							type="text"
							placeholder="Cari kelas, topik, keahlian..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setCurrentPage(1);
							}}
							className="bg-white border-0 shadow-none ps-1 pe-2 py-2 text-dark explore-search-input"
							style={{ fontSize: '0.875rem' }}
						/>

						{searchQuery && (
							<Button
								variant="link"
								className="text-muted text-decoration-none border-0 p-1 me-2 rounded-circle d-flex align-items-center justify-content-center explore-search-clear-btn"
								onClick={() => setSearchQuery('')}
								title="Hapus pencarian"
								style={{ width: '24px', height: '24px' }}
							>
								<X size={14} />
							</Button>
						)}
					</InputGroup>

					{/* Mobile Filter Button */}
					<Button
						variant="outline-secondary"
						className="d-lg-none d-flex align-items-center justify-content-center gap-2 px-3 py-2 bg-white rounded-3 border text-dark fw-medium text-nowrap flex-shrink-0 explore-filter-btn-mobile"
						onClick={() => setShowMobileFilter(true)}
						style={{ fontSize: '0.875rem', height: '38px' }}
					>
						<SlidersHorizontal size={15} className="text-secondary" />
						<span>Filter</span>
						{activeChips.length > 0 && (
							<span className="badge rounded-pill bg-primary ms-1">
								{activeChips.length}
							</span>
						)}
					</Button>
				</div>
			</Col>
		</Row>

		{/* 2. CATEGORY TABS */}
		<div className="d-flex justify-content-between">
			<div className="d-flex align-items-center gap-2 pt-2 explore-tabs-scroll overflow-auto pb-1">
				{/* Tab: Semua Konten (Neutral / Dark Navy) */}
				<button
					type="button"
					className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 transition-all ${
						activeTab === 'all' ? 'text-white shadow-sm' : 'border text-dark'
					}`}
					style={{
						backgroundColor:
							activeTab === 'all' ? 'var(--color-text)' : 'var(--color-white)',
						borderColor:
							activeTab === 'all' ? 'var(--color-text)' : 'var(--neutral-border)',
					}}
					onClick={() => {
						setActiveTab('all');
						setCurrentPage(1);
					}}
				>
					<span>Semua Konten</span>
					<span
						className="badge rounded-pill"
						style={{
							backgroundColor:
								activeTab === 'all'
									? 'rgba(255, 255, 255, 0.2)'
									: 'var(--neutral-bg)',
							color: activeTab === 'all' ? '#ffffff' : 'var(--neutral-text)',
						}}
					>
						{tabCounts.all}
					</span>
				</button>

				{/* Tab: Learning Paths (Bahama Blue Theme) */}
				<button
					type="button"
					className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 transition-all ${
						activeTab === 'learning_path' ? 'shadow-sm' : 'border'
					}`}
					style={{
						backgroundColor:
							activeTab === 'learning_path'
								? 'var(--bahama-blue-600)'
								: 'var(--bahama-blue-50)',
						borderColor:
							activeTab === 'learning_path'
								? 'var(--bahama-blue-600)'
								: 'var(--bahama-blue-200)',
						color: activeTab === 'learning_path' ? '#ffffff' : 'var(--bahama-blue-700)',
					}}
					onClick={() => {
						setActiveTab('learning_path');
						setCurrentPage(1);
					}}
				>
					<Compass
						size={15}
						style={{
							color:
								activeTab === 'learning_path'
									? '#ffffff'
									: 'var(--bahama-blue-500)',
						}}
					/>
					<span>Learning Paths</span>
					<span
						className="badge rounded-pill"
						style={{
							backgroundColor:
								activeTab === 'learning_path'
									? 'rgba(255, 255, 255, 0.25)'
									: 'var(--bahama-blue-100)',
							color:
								activeTab === 'learning_path'
									? '#ffffff'
									: 'var(--bahama-blue-800)',
						}}
					>
						{tabCounts.learning_path}
					</span>
				</button>

				{/* Tab: Modul (Purple Theme) */}
				<button
					type="button"
					className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 transition-all ${
						activeTab === 'module' ? 'shadow-sm' : 'border'
					}`}
					style={{
						backgroundColor:
							activeTab === 'module' ? 'var(--purple-text)' : 'var(--purple-bg)',
						borderColor:
							activeTab === 'module'
								? 'var(--purple-text)'
								: 'var(--purple-border-color)',
						color: activeTab === 'module' ? '#ffffff' : 'var(--purple-text)',
					}}
					onClick={() => {
						setActiveTab('module');
						setCurrentPage(1);
					}}
				>
					<Layers
						size={15}
						style={{ color: activeTab === 'module' ? '#ffffff' : 'var(--purple-text)' }}
					/>
					<span>Modul</span>
					<span
						className="badge rounded-pill"
						style={{
							backgroundColor:
								activeTab === 'module'
									? 'rgba(255, 255, 255, 0.25)'
									: 'var(--purple-border-color)',
							color: activeTab === 'module' ? '#ffffff' : 'var(--purple-text)',
						}}
					>
						{tabCounts.module}
					</span>
				</button>

				{/* Tab: Microlearning / Lesson (Amber / Warning Theme) */}
				<button
					type="button"
					className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-2 text-nowrap flex-shrink-0 transition-all ${
						activeTab === 'lesson' ? 'shadow-sm' : 'border'
					}`}
					style={{
						backgroundColor:
							activeTab === 'lesson' ? 'var(--warning-text)' : 'var(--warning-bg)',
						borderColor:
							activeTab === 'lesson'
								? 'var(--warning-text)'
								: 'var(--warning-border)',
						color: activeTab === 'lesson' ? '#ffffff' : 'var(--warning-text)',
					}}
					onClick={() => {
						setActiveTab('lesson');
						setCurrentPage(1);
					}}
				>
					<Zap
						size={15}
						style={{ color: activeTab === 'lesson' ? '#ffffff' : '#d97706' }}
					/>
					<span>Microlearning / Lesson</span>
					<span
						className="badge rounded-pill"
						style={{
							backgroundColor:
								activeTab === 'lesson' ? 'rgba(255, 255, 255, 0.25)' : '#fde68a',
							color: activeTab === 'lesson' ? '#ffffff' : 'var(--warning-text)',
						}}
					>
						{tabCounts.lesson}
					</span>
				</button>
			</div>

			{/* Top Bar: Sort & View Switcher */}
			<div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
				<div className="d-flex align-items-center gap-2">
					{searchQuery && (
						<span className="text-muted small text-truncate explore-query-truncate">
							untuk "<strong>{searchQuery}</strong>"
						</span>
					)}
				</div>

				<div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-2">
					{/* Sort By Dropdown */}
					<div className="d-flex align-items-center gap-2 flex-grow-1 flex-sm-grow-0">
						<span className="text-muted small d-none d-md-inline text-nowrap">
							Urutkan:
						</span>
						<Form.Select
							size="sm"
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="bg-white border shadow-none rounded-3 fw-medium text-dark w-100 explore-sort-select"
						>
							<option value="relevance">Paling Relevan</option>
							<option value="newest">Terbaru</option>
							<option value="popular">Terpopuler</option>
							<option value="rating">Rating Tertinggi</option>
							<option value="duration_asc">Durasi Terpendek</option>
						</Form.Select>
					</div>

					{/* View Switcher */}
					<div className="bg-white btn-group border rounded-3 p-1 flex-shrink-0">
						<button
							type="button"
							className={`btn btn-sm border-0 py-1 px-2 rounded-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
							onClick={() => setViewMode('grid')}
							title="Grid View"
						>
							<LayoutGrid size={15} />
						</button>
						<button
							type="button"
							className={`btn btn-sm border-0 py-1 px-2 rounded-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
							onClick={() => setViewMode('list')}
							title="List View"
						>
							<List size={15} />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
);

export default ExploreHeader;
