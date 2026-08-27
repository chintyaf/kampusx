import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarDays, Settings } from 'lucide-react';

export const QuickActions = () => {
	return (
		<div className="org-command-column-card p-4 border bg-white rounded-3 shadow-sm h-100">
			<h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
				<Settings size={18} className="text-secondary" />
				Aksi Cepat
			</h5>
			<div className="row g-3">
				<div className="col-6">
					<Link to="/organizer/buat-acara" className="quick-action-link-box p-3 border rounded-3 text-center bg-light text-decoration-none d-flex flex-column align-items-center justify-content-center h-100">
						<Plus size={20} className="text-dark mb-2" />
						<span className="fw-bold text-dark fs-5 block mb-1">Buat Event Baru</span>
						<small className="text-muted text-xs">Jadwalkan acara baru</small>
					</Link>
				</div>
				<div className="col-6">
					<Link to="/organizer/daftar-acara" className="quick-action-link-box p-3 border rounded-3 text-center bg-light text-decoration-none d-flex flex-column align-items-center justify-content-center h-100">
						<CalendarDays size={20} className="text-dark mb-2" />
						<span className="fw-bold text-dark fs-5 block mb-1">Daftar Acara</span>
						<small className="text-muted text-xs">Kelola semua acara</small>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default QuickActions;
