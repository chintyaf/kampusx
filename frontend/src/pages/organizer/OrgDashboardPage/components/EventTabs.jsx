export const EventTabs = ({ activeTab, setActiveTab }) => {
	const tabs = [
		{ id: 'all', label: 'Semua' },
		{ id: 'upcoming', label: 'Mendatang' },
		{ id: 'ongoing', label: 'Sedang Berjalan' },
		{ id: 'completed', label: 'Selesai' },
		{ id: 'draft', label: 'Draft' },
		{ id: 'cancelled', label: 'Dibatalkan' },
	];

	return (
		<div className="d-flex gap-2 mb-4 border-bottom pb-3">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => setActiveTab(tab.id)}
					className={`btn fw-medium px-4 py-2 fs-5 rounded-pill ${
						activeTab === tab.id ? 'btn-dark' : 'btn-light text-muted border-0'
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
};

export default EventTabs;
