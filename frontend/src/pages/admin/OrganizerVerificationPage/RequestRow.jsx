import { useState } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

import AffiliationInfo from './AffiliationInfo';
import ProofDocument from './ProofDocument';

const RequestRow = ({ request, onAction }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const getStatusBadge = (status) => {
		switch (status) {
			case 'approved':
				return (
					<Badge
						bg="success-subtle"
						className="d-inline-flex align-items-center gap-1 px-2 py-1 text-success rounded-pill"
						style={{ fontSize: '12px', fontWeight: 600 }}
					>
						<CheckCircle2 size={13} /> Approved
					</Badge>
				);
			case 'rejected':
				return (
					<Badge
						bg="danger-subtle"
						className="d-inline-flex align-items-center gap-1 px-2 py-1 text-danger rounded-pill"
						style={{ fontSize: '12px', fontWeight: 600 }}
					>
						<XCircle size={13} /> Rejected
					</Badge>
				);
			default:
				return (
					<Badge
						bg="warning-subtle"
						className="d-inline-flex align-items-center gap-1 px-2 py-1 text-warning rounded-pill"
						style={{ fontSize: '12px', fontWeight: 600 }}
					>
						<Clock size={13} /> Pending
					</Badge>
				);
		}
	};

	return (
		<>
			<tr
				style={{
					cursor: 'pointer',
					transition: 'background-color 0.2s',
					backgroundColor: isExpanded ? 'var(--bg-light-subtle, #f8f9fa)' : 'transparent',
				}}
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<td>
					<div className="user-cell d-flex align-items-center gap-2">
						<div
							className="user-avatar d-flex align-items-center justify-content-center rounded-circle"
							style={{
								background: 'var(--primary-light, #eff6ff)',
								color: 'var(--primary, #2563eb)',
								fontWeight: 600,
								width: '32px',
								height: '32px',
								fontSize: '14px',
							}}
						>
							{request.user?.name ? request.user.name.charAt(0).toUpperCase() : '?'}
						</div>
						<div>
							<div className="user-name fw-semibold">
								{request.user?.name || 'Unknown User'}
							</div>
							<div className="user-email text-muted small">
								{request.user?.email || '—'}
							</div>
						</div>
					</div>
				</td>
				<td className="text-muted align-middle">{request.user?.phone || '—'}</td>
				<td className="align-middle">{getStatusBadge(request.status)}</td>
				<td className="text-muted align-middle">
					{request.created_at ? request.created_at.split('T')[0] : '—'}
				</td>
				<td className="align-middle">
					<div onClick={(e) => e.stopPropagation()}>
						<Button
							size="sm"
							variant={isExpanded ? 'secondary' : 'primary'}
							className="d-inline-flex align-items-center gap-1"
							style={{
								padding: '4px 12px',
								fontSize: 11,
								fontWeight: 600,
								borderRadius: 6,
							}}
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? 'Tutup' : 'Tinjau'}
						</Button>
					</div>
				</td>
			</tr>
			{isExpanded && (
				<tr style={{ backgroundColor: 'var(--bg-light-subtle, #f8f9fa)' }}>
					<td colSpan={5}>
						<div
							className="border bg-white d-flex flex-column gap-4 p-4 rounded"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="d-flex flex-column gap-4 flex-lg-row">
								{/* Kolom Kiri: Informasi Afiliasi */}
								<AffiliationInfo request={request} />

								{/* Kolom Kanan: Berkas Bukti Keanggotaan */}
								<ProofDocument request={request} />
							</div>

							{/* Action Buttons Footer */}
							<div>
								{request.status === 'pending' ? (
									<>
										<Button
											size="sm"
											variant="danger"
											className="d-inline-flex align-items-center gap-1.5"
											style={{
												padding: '6px 16px',
												fontSize: '12.5px',
												fontWeight: 600,
												borderRadius: 8,
											}}
											onClick={() => onAction(request, 'rejected')}
											title="Tolak Permohonan"
										>
											<XCircle size={14} /> Tolak Pengajuan
										</Button>
										<Button
											size="sm"
											variant="success"
											className="d-inline-flex align-items-center gap-1.5"
											style={{
												padding: '6px 16px',
												fontSize: '12.5px',
												fontWeight: 600,
												borderRadius: 8,
											}}
											onClick={() => onAction(request, 'approved')}
											title="Setujui Permohonan"
										>
											<CheckCircle2 size={14} /> Setujui Pengajuan
										</Button>
									</>
								) : request.status === 'approved' ? (
									<Button
										size="sm"
										variant="outline-danger"
										style={{
											padding: '6px 16px',
											fontSize: '12.5px',
											fontWeight: 600,
											borderRadius: 8,
										}}
										onClick={() => onAction(request, 'rejected')}
										title="Tolak Pengajuan & Revoke Hak"
									>
										Tolak (Revoke)
									</Button>
								) : (
									<>
										<Button
											size="sm"
											variant="outline-secondary"
											style={{
												padding: '6px 16px',
												fontSize: '12.5px',
												fontWeight: 600,
												borderRadius: 8,
												backgroundColor: '#f8fafc',
											}}
											onClick={() => onAction(request, 'rejected')}
											title="Edit Alasan Penolakan"
										>
											Edit Alasan
										</Button>
										<Button
											size="sm"
											variant="outline-success"
											style={{
												padding: '6px 16px',
												fontSize: '12.5px',
												fontWeight: 600,
												borderRadius: 8,
											}}
											onClick={() => onAction(request, 'approved')}
											title="Setujui Pengajuan"
										>
											Setujui
										</Button>
									</>
								)}
							</div>
						</div>
					</td>
				</tr>
			)}
		</>
	);
};

export default RequestRow;
