import React, { useState } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
import { ChevronDown, ChevronUp, Plus, X, Calendar, Trash2 } from 'lucide-react';
import SessionRow from './SessionRow';
import { formatDate, calculateTotalDuration } from '@/utils/dateUtils';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

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
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const sessions = dayItem.sessions || [];

	// Gunakan day_number dari API atau urutan index
	const dayNumber = dayItem.day_number || dayIndex + 1;

	return (
		<div className="custom-card mb-3 shadow-sm">
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
					<Button
						variant="light"
						className="d-flex align-items-center gap-2 shadow-none btn-delete-subtle border-0 bg-transparent p-1" // Menggunakan class custom & utilitas bootstrap
						onClick={(e) => {
							e.stopPropagation(); // Tetap mencegah collapse terpicu
							setShowDeleteModal(true);
						}}
						size="sm"
					>
						{/* Menggunakan ikon Trash yang lebih universal, dengan warna muted secara default */}
						<Trash2 size={16} className="text-secondary" />
					</Button>
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
						<div className="d-flex flex-column gap-1">
							{/* Label opsional tapi sangat membantu memperjelas fokus */}
							<span className="form-label required">Tanggal Pelaksanaan</span>

							<div className="d-flex align-items-center gap-2 position-relative">
								{/* Menggunakan Form.Control dengan gaya flat design */}
								<Form.Control
									type="date"
									value={dayItem.date || ''}
									min={new Date().toISOString().split('T')[0]}
									onChange={(e) => onEditDayDate(e.target.value)}
									className="fw-medium shadow-none" // shadow-none mematikan efek glow bawaan bootstrap
								/>
							</div>
						</div>
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

						<div className="d-flex flex-column align-items-start mt-2">
							<button
								type="button"
								className="btn-add gap-1 w-100"
								onClick={onAddSession}
								disabled={!dayItem.date}
								style={{
									opacity: dayItem.date ? 1 : 0.6,
									cursor: dayItem.date ? 'pointer' : 'not-allowed',
								}}
							>
								<Plus size={15} />
								Tambah Sesi ke Hari {dayNumber}
							</button>
							{!dayItem.date && (
								<span className="text-secondary mt-1 fs-5">
									Tanggal pelaksanaan Hari {dayNumber} harus diisi terlebih dahulu
									sebelum menambahkan sesi.
								</span>
							)}
						</div>
					</div>
				</div>
			</Collapse>

			<ConfirmationModal
				show={showDeleteModal}
				onHide={() => setShowDeleteModal(false)}
				onConfirm={() => {
					setShowDeleteModal(false);
					onDeleteDay(dayItem.id);
				}}
				config={{
					title: 'Hapus Hari Pelaksanaan',
					desc: `Apakah Anda yakin ingin menghapus Hari ${dayNumber} beserta seluruh sesinya? Tindakan ini tidak dapat dibatalkan.`,
					icon: Trash2,
					iconColor: '#ef4444',
					iconBg: '#fee2e2',
					iconBorder: '#fecaca',
					btnVariant: 'danger',
				}}
			/>
		</div>
	);
};

export default SessionCard;
