import React from 'react';
import { Activity } from 'lucide-react';

export const ActivityLog = ({ activities }) => {
	return (
		<div className="org-command-column-card p-4 border bg-white rounded-3 shadow-sm h-100">
			<h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
				<Activity size={18} className="text-secondary" />
				Aktivitas Terkini
			</h5>
			<div className="d-flex flex-column gap-3">
				{activities.map((log) => (
					<div key={log.id} className="activity-feed-item d-flex gap-3 align-items-start pb-2 border-bottom border-light">
						<div className="activity-marker-circle mt-1 flex-shrink-0" />
						<div className="flex-grow-1 min-w-0">
							<p className="text-dark text-xs mb-1 font-medium">{log.text}</p>
							<small className="text-muted text-xxs d-block">{log.time}</small>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ActivityLog;
