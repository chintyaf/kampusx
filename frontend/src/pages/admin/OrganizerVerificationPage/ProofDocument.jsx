import { Button, Image } from 'react-bootstrap';
import { FileText, ExternalLink } from 'lucide-react';

const ProofDocument = ({ request }) => {
	const isImageFile = (path) => {
		if (!path) return false;
		const ext = path.split('.').pop().toLowerCase();
		return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
	};

	return (
		<div className="d-flex flex-column gap-3 w-100">
			<h5
				className="m-0 d-flex align-items-center gap-2 fw-bold"
				style={{
					fontSize: '15px',
					color: 'var(--text-color, #1e293b)',
				}}
			>
				<FileText
					size={18}
					style={{ color: 'var(--primary, #2563eb)' }}
				/>
				Dokumen Bukti Keanggotaan
			</h5>

			{request.proof_url ? (
				<div
					className="p-3 border rounded-3 d-flex flex-column gap-3 align-items-center justify-content-center bg-light"
					style={{
						minHeight: '200px',
					}}
				>
					{isImageFile(request.proof_path) ? (
						<div className="d-flex flex-column align-items-center gap-2 w-100">
							<a
								href={request.proof_url}
								target="_blank"
								rel="noopener noreferrer"
								className="d-block w-100 text-center"
								style={{ maxWidth: '240px', cursor: 'zoom-in' }}
							>
								<Image
									src={request.proof_url}
									alt="Bukti Keanggotaan"
									fluid
									className="border shadow-sm rounded bg-white"
									style={{
										maxHeight: '160px',
										objectFit: 'contain',
										transition: 'all 0.2s ease-in-out',
										padding: '4px',
									}}
									onMouseOver={(e) => {
										e.currentTarget.style.transform = 'scale(1.03)';
										e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
									}}
									onMouseOut={(e) => {
										e.currentTarget.style.transform = 'scale(1)';
										e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
									}}
								/>
							</a>
							<span className="small text-muted" style={{ fontSize: '11px' }}>
								Klik gambar untuk memperbesar
							</span>
						</div>
					) : (
						<div className="d-flex flex-column align-items-center gap-2 py-4">
							<FileText size={48} className="text-muted mb-2" />
							<span
								className="fw-semibold text-dark"
								style={{ fontSize: '13.5px' }}
							>
								Dokumen PDF / Berkas Bukti
							</span>
						</div>
					)}

					<Button
						as="a"
						href={request.proof_url}
						target="_blank"
						rel="noopener noreferrer"
						variant="primary"
						size="sm"
						className="d-inline-flex align-items-center gap-2 fw-semibold px-3 py-2 mt-1 shadow-sm text-white"
						style={{
							fontSize: '12px',
							borderRadius: '8px',
						}}
					>
						<ExternalLink size={14} /> Buka Dokumen di Tab Baru
					</Button>
				</div>
			) : (
				<div
					className="p-4 border border-dashed border-danger-subtle rounded-3 text-danger text-center fw-semibold"
					style={{
						backgroundColor: 'var(--danger-bg, #fef2f2)',
						fontSize: '13.5px',
					}}
				>
					Tidak ada dokumen bukti yang diunggah.
				</div>
			)}
		</div>
	);
};

export default ProofDocument;
