import React from 'react';
import { Form } from 'react-bootstrap';
import { Filter, RotateCcw, Sparkles, Target } from 'lucide-react';
import { TOPIC_OPTIONS, LEVEL_OPTIONS, DURATION_OPTIONS, MEDIA_OPTIONS } from './mockData';

/**
 * FilterSidebarContent
 * Komponen isi sidebar filter — digunakan di desktop sidebar & mobile Offcanvas.
 */
const FilterSidebarContent = ({
	idPrefix = 'desktop', // Prefix unik untuk cegah duplicate ID pada DOM
	activeChips = [],
	selectedTopics = [],
	selectedLevels = [],
	selectedDurations = [],
	selectedMedia = [],
	aiRecommendedOnly = false,
	weeklyGoalOnly = false,
	setSelectedTopics,
	setSelectedLevels,
	setSelectedDurations,
	setSelectedMedia,
	setAiRecommendedOnly,
	setWeeklyGoalOnly,
	setCurrentPage,
	handleResetFilters,
	toggleArrayItem,
}) => (
	<div className="d-flex flex-column gap-4">
		{/* Header */}
		<div className="d-flex align-items-center justify-content-between pb-3 border-bottom">
			<div className="d-flex align-items-center gap-2">
				<h5 className="fw-bold mb-0 text-dark explore-filter-title">Filter Pencarian</h5>
			</div>
			{activeChips.length > 0 && (
				<button
					type="button"
					className="btn btn-link text-decoration-none p-0 small fw-semibold text-danger d-inline-flex align-items-center gap-1"
					onClick={handleResetFilters}
				>
					<RotateCcw size={12} />
					<span>Reset All</span>
				</button>
			)}
		</div>


		{/* 2. Topik / Kategori */}
		<div>
			<div className="fw-bold text-dark small text-uppercase mb-2 explore-filter-heading">
				Topik & Keahlian
			</div>
			<div className="d-flex flex-column gap-2">
				{TOPIC_OPTIONS.map((topic) => (
					<Form.Check
						key={topic}
						type="checkbox"
						id={`${idPrefix}-filter-topic-${topic}`}
						label={<span className="small text-secondary fw-medium ms-1">{topic}</span>}
						checked={selectedTopics.includes(topic)}
						onChange={() => toggleArrayItem(setSelectedTopics, topic)}
					/>
				))}
			</div>
		</div>

		{/* 3. Level Kesulitan */}
		<div className="pt-3 border-top">
			<div className="fw-bold text-dark small text-uppercase mb-2 explore-filter-heading">
				Tingkat Kesulitan
			</div>
			<div className="d-flex flex-column gap-2">
				{LEVEL_OPTIONS.map((lvl) => (
					<Form.Check
						key={lvl}
						type="checkbox"
						id={`${idPrefix}-filter-lvl-${lvl}`}
						label={<span className="small text-secondary fw-medium ms-1">{lvl}</span>}
						checked={selectedLevels.includes(lvl)}
						onChange={() => toggleArrayItem(setSelectedLevels, lvl)}
					/>
				))}
			</div>
		</div>

		{/* 4. Durasi Belajar */}
		<div className="pt-3 border-top">
			<div className="fw-bold text-dark small text-uppercase mb-2 explore-filter-heading">
				Estimasi Durasi
			</div>
			<div className="d-flex flex-column gap-2">
				{DURATION_OPTIONS.map((dur) => (
					<Form.Check
						key={dur.value}
						type="checkbox"
						id={`${idPrefix}-filter-dur-${dur.value}`}
						label={
							<span className="small text-secondary fw-medium ms-1">{dur.label}</span>
						}
						checked={selectedDurations.includes(dur.value)}
						onChange={() => toggleArrayItem(setSelectedDurations, dur.value)}
					/>
				))}
			</div>
		</div>

		{/* 5. Tipe Konten / Media */}
		<div className="pt-3 border-top">
			<div className="fw-bold text-dark small text-uppercase mb-2 explore-filter-heading">
				Format Media
			</div>
			<div className="d-flex flex-column gap-2">
				{MEDIA_OPTIONS.map((med) => (
					<Form.Check
						key={med.value}
						type="checkbox"
						id={`${idPrefix}-filter-med-${med.value}`}
						label={
							<span className="small text-secondary fw-medium ms-1">{med.label}</span>
						}
						checked={selectedMedia.includes(med.value)}
						onChange={() => toggleArrayItem(setSelectedMedia, med.value)}
					/>
				))}
			</div>
		</div>
	</div>
);

export default FilterSidebarContent;
