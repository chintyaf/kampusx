import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import SessionRow from './SessionRow';
import DateHeaderForm from './DateHeaderForm';
import { formatDate, calculateTotalDuration } from '@/utils/dateUtils';

const SessionCard = ({
	dayIndex,
	dayItem,
	selectedRow,
	setSelectedRow,
	onAddSession,
	onDeleteDay,
	onEditDayDate,
	onSidebarChange,
}) => {
	const [open, setOpen] = useState(true);
	const sessions = dayItem.sessions || [];

	// Gunakan day_number dari API atau urutan index
	const dayNumber = dayItem.day_number || dayIndex + 1;

	return (
		<div className="custom-ticket-card mb-3 shadow-sm">
			<div
				className={`px-4 subtle py-3 d-flex justify-content-between align-items-center ${open ? 'border-bottom' : ''}`}
				style={{
					cursor: 'pointer',
					transition: 'background-color 0.2s',
				}}
				onClick={() => setOpen(!open)}
			>
				<div className="d-flex align-items-center gap-3">
					<div className="custom-badge-number border">{dayNumber}</div>
					<p className="mb-0">
						<span className="text-dark fw-semibold me-2 fs-3">Hari {dayNumber}</span>
						<span className="text-secondary fs-4">
							{dayItem.date ? formatDate(dayItem.date) : 'Tanggal belum diatur'}
						</span>
					</p>
				</div>
				<div className="d-flex align-items-center gap-3">
					<div className="d-flex gap-2 mb-0">
						<p className="text-secondary fs-4 mb-0">{sessions.length} sesi</p>
						<p className="text-secondary fs-4 mb-0">-</p>
						<p className="text-secondary fs-4 mb-0">
							{calculateTotalDuration(sessions)}
						</p>
					</div>
					{open ? (
						<ChevronUp size={20} className="text-muted" strokeWidth={1.5} />
					) : (
						<ChevronDown size={20} className="text-muted" strokeWidth={1.5} />
					)}
				</div>
			</div>

			<Collapse in={open}>
				<div className="px-4 py-3">
					<div className="d-flex flex-column gap-2">
						{/* Pass fungsi edit & delete ke Header Form */}
						<DateHeaderForm
							date={dayItem.date}
							onDelete={onDeleteDay}
							onEdit={onEditDayDate}
						/>

						<div className="d-flex flex-column gap-2">
							{[...sessions]
								.sort((a, b) =>
									a.isHidden === b.isHidden ? 0 : a.isHidden ? 1 : -1,
								)
								.map((session) => (
									<SessionRow
										key={session.id}
										selectedRow={selectedRow?.id === session.id}
										onClick={() => {
											if (selectedRow?.id === session.id) {
												setSelectedRow(null);
												onSidebarChange('summary');
											} else {
												setSelectedRow(session);
												onSidebarChange('session-form');
											}
										}}
										session={session}
									/>
								))}
						</div>

						{/* Ubah teks agar hari dinamis */}
						<button className="btn-add gap-1 mt-2" onClick={onAddSession}>
							<Plus size={15} />
							Tambah Sesi ke Hari {dayNumber}
						</button>
					</div>
				</div>
			</Collapse>
		</div>
	);
};

export default SessionCard;
