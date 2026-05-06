import React from 'react';
import { Dot, X } from 'lucide-react';
import { Badge } from 'react-bootstrap';
import { calculateTotalDuration } from '@/utils/dateUtils';
const SessionRow = ({ session, selectedRow, onClick }) => {
	console.log(session);
	return (
		<div
			className={`session-card-row d-flex align-items-center py-2 px-3 rounded-2 ${selectedRow ? 'select' : ''}`}
			onClick={onClick}
		>
			{/* BAGIAN KIRI: Waktu dan Label */}
			<div className="d-flex align-items-center">
				<div className="d-flex align-items-center">
					<Dot color="#b07436" size={20} strokeWidth={5} />
					<span className="text-secondary fs-5 text-nowrap">
						{session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}
					</span>
				</div>
				{/* <Badge pill bg="white" text="secondary" className="border ms-2 fw-normal no-before">
					Keynote
				</Badge> */}
			</div>
			<div className="flex-grow-1 px-3 fs-4 text-truncate">{session.title}</div>

			<div className="d-flex align-items-center gap-4">
				<span className="text-secondary fs-5 text-nowrap">
					{calculateTotalDuration([session])}
				</span>
				<div className="d-flex align-items-center gap-1">
					{/* Avatar Dummy (Ganti src dengan data aslinya nanti) */}
					<img
						src="https://i.pravatar.cc/150?img=32"
						alt="Speaker Avatar"
						className="rounded-circle object-fit-cover"
						width="25"
						height="25"
					/>
					<img
						src="https://i.pravatar.cc/150?img=32"
						alt="Speaker Avatar"
						className="rounded-circle object-fit-cover"
						width="25"
						height="25"
					/>
				</div>
				{/* Icon Hapus */}
				{/* <X size={15} strokeWidth={2} className="icon-delete" /> */}
			</div>
		</div>
	);
};

export default SessionRow;
