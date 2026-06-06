import { Button, Image } from 'react-bootstrap';
import { FileText, ExternalLink } from 'lucide-react';

const ProofDocument = ({ request }) => {
	const isImageFile = (path) => {
		if (!path) return false;
		const ext = path.split('.').pop().toLowerCase();
		return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
	};

	return (
		<div className="d-flex flex-column gap-3 col-lg-3">
			<h4
				className="m-0 d-flex align-items-center gap-2 fw-semibold"
				style={{
					fontSize: '15px',
					color: 'var(--text-color, #1e293b)',
				}}
			>
				<FileText
					size={16}
					style={{ color: 'var(--primary, #2563eb)' }}
				/>
				Dokumen Bukti Keanggotaan
			</h4>

			{request.proof_url ? (
				<div
					className="p-3 border border-dashed rounded d-flex flex-column gap-3 align-items-center justify-content-center"
					style={{
						backgroundColor: 'var(--bg-light, #f8fafc)',
						minHeight: '120px',
					}}
				>
					{isImageFile(request.proof_path) ? (
						<div className="d-flex flex-column align-items-center gap-2 w-100">
							<a
								href={request.proof_url}
								target="_blank"
								rel="noopener noreferrer"
								className="d-block w-100 text-center"
								style={{ maxWidth: '200px', cursor: 'zoom-in' }}
							>
								<Image
									src={request.proof_url}
									alt="Bukti Keanggotaan"
									fluid
									className="border"
									style={{
										maxHeight: '120px',
										objectFit: 'contain',
										borderRadius: '6px',
										backgroundColor: '#ffffff',
									}}
								/>
							</a>
							<span className="small text-muted">
								Klik gambar untuk memperbesar
							</span>
						</div>
					) : (
						<div className="d-flex flex-column align-items-center gap-2">
							<FileText size={36} className="text-muted" />
							<span
								className="fw-medium"
								style={{
									fontSize: '13px',
									color: 'var(--text-color, #1e293b)',
								}}
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
						variant="outline-secondary"
						size="sm"
						className="d-inline-flex align-items-center gap-2 fw-semibold"
						style={{
							fontSize: '12px',
							backgroundColor: '#ffffff',
							color: 'var(--text-color, #1e293b)',
						}}
					>
						<ExternalLink size={12} /> Buka Dokumen di Tab Baru
					</Button>
				</div>
			) : (
				<div
					className="p-3 border border-dashed border-danger-subtle rounded text-danger text-center fw-medium"
					style={{
						backgroundColor: 'var(--danger-bg, #fef2f2)',
						fontSize: '13px',
					}}
				>
					Tidak ada dokumen bukti yang diunggah.
				</div>
			)}
		</div>
	);
};

export default ProofDocument;
