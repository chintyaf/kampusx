import React from 'react';
import { MessageCircle } from 'lucide-react';

const DiscussionTab = () => {
	return (
		<div className="fade-in text-center py-5">
			<MessageCircle size={48} className="text-muted mb-3 opacity-50" />
			<h5 className="fw-bold text-muted">Forum Diskusi</h5>
			<p className="text-muted small">
				Ruang diskusi untuk event ini akan segera dibuka oleh penyelenggara.
			</p>
		</div>
	);
};

export default DiscussionTab;
