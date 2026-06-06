import { Badge } from 'react-bootstrap';
import { Users, AlertCircle, FileText } from 'lucide-react';

const AffiliationInfo = ({ request }) => {
	return (
		<div className="d-flex flex-column gap-3 w-100">
			<h5
				className="m-0 d-flex align-items-center gap-2 fw-bold"
				style={{
					fontSize: '15px',
					color: 'var(--text-color, #1e293b)',
				}}
			>
				<Users size={18} style={{ color: 'var(--primary, #2563eb)' }} />
				Informasi Afiliasi & Organisasi
			</h5>

			{/* Core Information Card */}
			<div
				className="p-3 border rounded-3 bg-light"
				style={{
					display: 'grid',
					gridTemplateColumns: '150px 1fr',
					gap: '12px 16px',
					fontSize: '13.5px',
				}}
			>
				<div className="fw-medium text-muted">Nama Organisasi:</div>
				<div className="fw-semibold text-dark">
					{request.organization_name || '—'}
				</div>

				<div className="fw-medium text-muted">Institusi Afiliasi:</div>
				<div className="d-flex align-items-center">
					{request.institution ? (
						<span className="fw-semibold text-dark">
							{request.institution.name}
						</span>
					) : request.custom_institution_name ? (
						<div className="d-flex flex-column gap-1 w-100">
							<span className="fw-semibold text-primary">
								{request.custom_institution_name}
							</span>
							<Badge
								bg="warning-subtle"
								className="d-inline-flex align-items-center gap-1 text-warning px-2 py-1 rounded-pill"
								style={{
									fontSize: '10.5px',
									fontWeight: 600,
									width: 'fit-content',
								}}
							>
								<AlertCircle size={10} /> Institusi Baru (Akan didaftarkan)
							</Badge>
						</div>
					) : (
						<Badge
							bg="primary-subtle"
							className="d-inline-flex align-items-center gap-1 text-primary px-2 py-1 rounded-pill"
							style={{
								fontSize: '10.5px',
								fontWeight: 600,
								width: 'fit-content',
							}}
						>
							Independent
						</Badge>
					)}
				</div>

				<div className="fw-medium text-muted">Masa Aktif Akun:</div>
				<div className="fw-semibold text-success" style={{ fontSize: '13px' }}>
					Aktif Selama Acara Produktif
				</div>
			</div>

			{/* Notes Block */}
			{request.note && (
				<div className="mt-1">
					<div className="fw-semibold text-muted mb-1.5" style={{ fontSize: '12px' }}>
						Catatan Tambahan:
					</div>
					<div
						className="p-3 border rounded-3 bg-white"
						style={{
							fontSize: '13px',
							color: '#475569',
							whiteSpace: 'pre-line',
							wordBreak: 'break-word',
							maxHeight: '120px',
							overflowY: 'auto',
							lineHeight: '1.6',
							borderLeft: '4px solid var(--primary, #2563eb)',
						}}
					>
						{request.note}
					</div>
				</div>
			)}

			{/* Rejection Reason Block */}
			{request.rejection_reason && (
				<div className="mt-1">
					<div className="fw-semibold text-danger mb-1.5" style={{ fontSize: '12px' }}>
						Alasan Penolakan Sebelumnya:
					</div>
					<div
						className="p-3 border border-danger-subtle rounded-3"
						style={{
							backgroundColor: 'var(--danger-bg, #fef2f2)',
							color: 'var(--danger-text, #991b1b)',
							fontSize: '13px',
							whiteSpace: 'pre-line',
							wordBreak: 'break-word',
							maxHeight: '120px',
							overflowY: 'auto',
							lineHeight: '1.6',
							borderLeft: '4px solid var(--danger-text, #ef4444)',
						}}
					>
						{request.rejection_reason}
					</div>
				</div>
			)}
		</div>
	);
};

export default AffiliationInfo;
