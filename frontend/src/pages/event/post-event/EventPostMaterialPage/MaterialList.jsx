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
		<div className="d-flex flex-column gap-3">
			{/* Tampilkan Video Replay URL jika ada */}
			{session.videoUrl && (
				<div className="border border-secondary-subtle p-3 rounded d-flex justify-content-between align-items-center">
					<div className="d-flex align-items-center gap-2 text-dark small fw-medium">
						<Link2 size={16} className="text-primary" />
						{session.videoUrl}
					</div>
					<Button variant="link" className="text-secondary p-0" onClick={onClearVideoUrl}>
						<X size={16} />
					</Button>
				</div>
			)}

			{/* Tampilkan Video Upload jika ada */}
			{session.videoFileName && (
				<div className="border border-secondary-subtle p-3 rounded d-flex justify-content-between align-items-center">
					<div className="d-flex align-items-center gap-2 text-dark small fw-medium">
						<Video size={16} className="text-primary" />
						{session.videoFileName}
					</div>
					<Button
						variant="link"
						className="text-secondary p-0"
						onClick={onClearVideoFile}
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
						className="d-flex align-items-center p-2 border border-secondary-subtle rounded bg-white hover-bg-light"
						style={{ transition: 'background-color 0.2s' }}
					>
						{/* <GripVertical
							size={16}
							className="text-secondary opacity-50 me-2"
							style={{ cursor: 'grab' }}
						/> */}
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
						<div className="d-flex gap-1 flex-shrink-0">
							<Button
								variant="light"
								size="sm"
								className="border border-secondary-subtle"
								onClick={() => onPreviewMaterial(material)}
							>
								<Eye size={14} />
							</Button>
							{material.url && (
								<Button
									variant="light"
									size="sm"
									className="border border-secondary-subtle"
									href={material.url}
									download={material.name}
								>
									<Download size={14} />
								</Button>
							)}
							<Button
								variant="link"
								className="text-secondary p-1 ms-1"
								onClick={() => onRemoveDocument(material.id)}
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
