import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ParticipantPagination = ({ showAll, pageInfo, handlePageChange }) => {
	if (showAll || pageInfo.last_page <= 1) return null;

	const buildItems = () => {
		const items = [];
		const { current_page, last_page } = pageInfo;
		const delta = 1;
		const range = [];

		for (
			let i = Math.max(2, current_page - delta);
			i <= Math.min(last_page - 1, current_page + delta);
			i++
		) {
			range.push(i);
		}

		const pages = [1, ...range, last_page].filter((v, i, arr) => arr.indexOf(v) === i);

		pages.forEach((page, idx) => {
			if (idx > 0 && page - pages[idx - 1] > 1) {
				items.push(
					<span key={`ellipsis-${idx}`} className="pagination-ellipsis">
						…
					</span>,
				);
			}
			items.push(
				<button
					key={page}
					className={`pagination-btn${page === current_page ? ' active' : ''}`}
					onClick={() => handlePageChange(page)}
				>
					{page}
				</button>,
			);
		});
		return items;
	};

	return (
		<div className="participant-pagination">
			<span className="pagination-info">
				Halaman {pageInfo.current_page} dari {pageInfo.last_page}
			</span>
			<div className="pagination-controls">
				<button
					className="pagination-btn pagination-nav"
					onClick={() => handlePageChange(pageInfo.current_page - 1)}
					disabled={pageInfo.current_page === 1}
				>
					<ChevronLeft size={14} />
				</button>
				{buildItems()}
				<button
					className="pagination-btn pagination-nav"
					onClick={() => handlePageChange(pageInfo.current_page + 1)}
					disabled={pageInfo.current_page === pageInfo.last_page}
				>
					<ChevronRight size={14} />
				</button>
			</div>
		</div>
	);
};

export default ParticipantPagination;
