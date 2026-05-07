import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, totalCount, perPage, onPageChange }) {
	const pages = useMemo(() => {
		if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
		const pts = new Set([1, 2]);
		if (currentPage > 3) pts.add('...');
		if (currentPage > 2 && currentPage < totalPages - 1) pts.add(currentPage);
		if (currentPage < totalPages - 2) pts.add('...');
		pts.add(totalPages - 1);
		pts.add(totalPages);
		return [...pts];
	}, [currentPage, totalPages]);

	const start = (currentPage - 1) * perPage + 1;
	const end = Math.min(currentPage * perPage, totalCount);

	return (
		<div className="pagination-bar">
			<span className="pagination-info">
				{totalCount === 0
					? 'No results found'
					: `Showing ${start}–${end} of ${totalCount} users`}
			</span>
			<div className="pagination-btns">
				<button
					className="pg-btn"
					disabled={currentPage === 1}
					onClick={() => onPageChange(currentPage - 1)}>
					<ChevronLeft size={14} />
				</button>
				{pages.map((p, i) =>
					p === '...' ? (
						<span key={`el-${i}`} className="pg-ellipsis">
							…
						</span>
					) : (
						<button
							key={p}
							className={`pg-btn${currentPage === p ? ' active' : ''}`}
							onClick={() => onPageChange(p)}>
							{p}
						</button>
					),
				)}
				<button
					className="pg-btn"
					disabled={currentPage === totalPages || totalPages === 0}
					onClick={() => onPageChange(currentPage + 1)}>
					<ChevronRight size={14} />
				</button>
			</div>
		</div>
	);
}
