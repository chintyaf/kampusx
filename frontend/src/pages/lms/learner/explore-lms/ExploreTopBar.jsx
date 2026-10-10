import React from 'react';
import { Form } from 'react-bootstrap';
import { LayoutGrid, List, X } from 'lucide-react';

/**
 * ExploreTopBar
 */
const ExploreTopBar = ({
	activeChips = [],
	handleResetFilters = () => {},
}) => (
	<>


		{/* Active Filter Chips Bar */}
		{activeChips?.length > 0 && (
			<div className="d-flex align-items-center gap-2 flex-wrap mb-3 p-3 bg-white rounded-3 border">
				<span className="text-muted small fw-semibold">Filter Aktif:</span>
				{activeChips.map((chip) => (
					<span
						key={chip.key}
						className="badge rounded-pill bg-light text-dark border px-3 py-1 d-inline-flex align-items-center gap-2 explore-chip"
					>
						<span>{chip.label}</span>
						<X
							size={13}
							className="text-muted explore-chip-remove"
							onClick={chip.onRemove}
							style={{ cursor: 'pointer' }}
						/>
					</span>
				))}
				<button
					type="button"
					className="btn btn-link text-decoration-none p-0 small fw-bold text-danger ms-auto"
					onClick={handleResetFilters}
				>
					Hapus Semua
				</button>
			</div>
		)}
	</>
);

export default ExploreTopBar;
