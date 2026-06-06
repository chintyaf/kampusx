import { Badge } from 'react-bootstrap';
import { Users, AlertCircle } from 'lucide-react';

const AffiliationInfo = ({ request }) => {
	return (
		<div className="d-flex flex-column gap-3 col-lg-8">
			<h4
				className="m-0 d-flex align-items-center gap-2 fw-semibold"
				style={{
					fontSize: '15px',
					color: 'var(--text-color, #1e293b)',
				}}
			>
				<Users size={16} style={{ color: 'var(--primary, #2563eb)' }} />
				Informasi Afiliasi & Organisasi
			</h4>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '150px 1fr',
					gap: '12px 16px',
					fontSize: '13px',
				}}
			>
				<div className="fw-medium text-muted">Nama Organisasi:</div>
				<div className="fw-semibold" style={{ color: 'var(--text-color, #1e293b)' }}>
					{request.organization_name || '—'}
				</div>

				<div className="fw-medium text-muted">Institusi Afiliasi:</div>
				<div>
					{request.institution ? (
						<span
							className="fw-semibold"
							style={{ color: 'var(--text-color, #1e293b)' }}
						>
							{request.institution.name}
						</span>
					) : request.custom_institution_name ? (
						<div className="d-flex flex-column gap-1">
							<span
								className="fw-semibold"
								style={{ color: 'var(--primary, #2563eb)' }}
							>
								{request.custom_institution_name}
							</span>
							<Badge
								bg="warning-subtle"
								className="d-inline-flex align-items-center gap-1 text-warning px-2 py-1 rounded"
								style={{
									fontSize: '11px',
									fontWeight: 600,
									width: 'fit-content',
								}}
							>
								<AlertCircle size={10} /> Institusi Baru (Akan otomatis didaftarkan
								jika disetujui)
							</Badge>
						</div>
					) : (
						<Badge
							bg="primary-subtle"
							className="d-inline-flex align-items-center gap-1 text-primary px-2 py-1 rounded"
							style={{
								fontSize: '11.5px',
								fontWeight: 600,
								width: 'fit-content',
							}}
						>
							Independent
						</Badge>
					)}
				</div>

				{request.note && (
					<>
						<div className="fw-medium text-muted">Catatan Tambahan:</div>
						<div
							className="p-2 border rounded"
							style={{
								backgroundColor: 'var(--bg-light, #f8fafc)',
								color: '#334155',
								whiteSpace: 'pre-line',
								wordBreak: 'break-word',
								minHeight: '100px',
								maxHeight: '120px',
								overflowY: 'auto',
							}}
						>
							{request.note}
						</div>
					</>
				)}

				{request.rejection_reason && (
					<>
						<div className="fw-semibold text-danger">Alasan Penolakan:</div>
						<div
							className="p-2 border border-danger-subtle rounded text-danger"
							style={{
								backgroundColor: 'var(--danger-bg, #fef2f2)',
								fontSize: '12.5px',
								whiteSpace: 'pre-line',
								wordBreak: 'break-word',
								maxHeight: '120px',
								overflowY: 'auto',
							}}
						>
							{request.rejection_reason}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default AffiliationInfo;
