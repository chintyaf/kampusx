import React from 'react';
import { Button } from 'react-bootstrap';
import { Link2, Video, X, GripVertical, Eye, Download } from 'lucide-react';
import { getFileIcon } from './utils';

const MaterialList = ({
	session,
	onClearVideoUrl,
	onClearVideoFile,
	onRemoveDocument,
	onPreviewMaterial,
}) => {
	// Jika tidak ada materi sama sekali, tidak perlu render container
	if (
		!session.videoUrl &&
		!session.videoFileName &&
		(!session.materials || session.materials.length === 0)
	) {
		return null;
	}

	return (
		<div className="d-flex flex-column gap-2">
			{/* Tampilkan Video Replay URL jika ada */}
			{session.videoUrl && (
				<div
					className="d-flex justify-content-between align-items-center p-3 rounded"
					style={{
						backgroundColor: '#f9fafb',
						transition: 'background-color 0.2s',
					}}
				>
					<div className="d-flex align-items-center gap-2 text-dark small fw-medium text-truncate">
						<Link2 size={16} style={{ color: '#475569' }} className="flex-shrink-0" />
						<span className="text-truncate">{session.videoUrl}</span>
					</div>
					<Button
						variant="link"
						className="text-secondary p-0 d-flex align-items-center justify-content-center"
						onClick={onClearVideoUrl}
						onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
						onMouseLeave={(e) => (e.currentTarget.style.color = '')}
					>
						<X size={16} />
					</Button>
				</div>
			)}

			{/* Tampilkan Video Upload jika ada */}
			{session.videoFileName && (
				<div
					className="d-flex justify-content-between align-items-center p-3 rounded"
					style={{
						backgroundColor: '#f9fafb',
						transition: 'background-color 0.2s',
					}}
				>
					<div className="d-flex align-items-center gap-2 text-dark small fw-medium text-truncate">
						<Video size={16} style={{ color: '#475569' }} className="flex-shrink-0" />
						<span className="text-truncate">{session.videoFileName}</span>
					</div>
					<Button
						variant="link"
						className="text-secondary p-0 d-flex align-items-center justify-content-center"
						onClick={onClearVideoFile}
						onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
						onMouseLeave={(e) => (e.currentTarget.style.color = '')}
					>
						<X size={16} />
					</Button>
				</div>
			)}

			{/* Tampilkan List Dokumen jika ada */}
			{session.materials?.map((material) => {
				const { Icon, bg, color } = getFileIcon(material.type);
				return (
					<div
						key={material.id}
						className="d-flex align-items-center p-3 rounded"
						style={{
							backgroundColor: '#f9fafb',
							transition: 'background-color 0.2s',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = '#f1f5f9';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = '#f9fafb';
						}}
					>
						<div
							className="rounded d-flex align-items-center justify-content-center flex-shrink-0 me-3"
							style={{ width: '36px', height: '36px', backgroundColor: bg }}
						>
							<Icon size={16} color={color} />
						</div>
						<div className="flex-grow-1 text-truncate pe-2">
							<p className="mb-0 text-dark small text-truncate fw-medium">
								{material.name}
							</p>
							<p className="mb-0 text-muted" style={{ fontSize: '11px' }}>
								{material.type} • {material.size}
							</p>
						</div>
						<div className="d-flex gap-2 flex-shrink-0 align-items-center">
							<Button
								variant="link"
								className="text-secondary p-1 d-flex align-items-center justify-content-center"
								onClick={() => onPreviewMaterial(material)}
								onMouseEnter={(e) => (e.currentTarget.style.color = '#1e293b')}
								onMouseLeave={(e) => (e.currentTarget.style.color = '')}
								title="Pratinjau"
							>
								<Eye size={16} />
							</Button>
							{material.url && (
								<Button
									variant="link"
									className="text-secondary p-1 d-flex align-items-center justify-content-center"
									href={material.url}
									download={material.name}
									onMouseEnter={(e) => (e.currentTarget.style.color = '#1e293b')}
									onMouseLeave={(e) => (e.currentTarget.style.color = '')}
									title="Unduh"
								>
									<Download size={16} />
								</Button>
							)}
							<Button
								variant="link"
								className="text-secondary p-1 d-flex align-items-center justify-content-center"
								onClick={() => onRemoveDocument(material.id)}
								onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
								onMouseLeave={(e) => (e.currentTarget.style.color = '')}
								title="Hapus"
							>
								<X size={16} />
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MaterialList;
