import React, { useState } from 'react';
import { Card, Badge, Button, Collapse, Spinner } from 'react-bootstrap';
import { ChevronDown, Trash2, CheckCircle, Users, BarChart2, ChevronUp } from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';
import VideoPreviewModal from './VideoPreviewModal';
import MaterialList from './MaterialList';
import AddMaterialForm from './AddMaterialForm';

const SessionContentCard = ({ session, sessionNumber, onUpdate, onDelete, hasPreviousSession }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [previewMaterial, setPreviewMaterial] = useState(null);
	const [showVideoPreview, setShowVideoPreview] = useState(false);

	// State untuk simulasi loading UI
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Handler yang disesuaikan untuk menerima File List langsung dari AddMaterialForm
	const addMaterial = (files) => {
		const fileArray = Array.from(files || []);
		const newMaterials = fileArray.map((f) => ({
			id: Date.now().toString() + f.name,
			name: f.name,
			type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
			size:
				f.size > 1048576
					? `${(f.size / 1048576).toFixed(1)} MB`
					: `${Math.round(f.size / 1024)} KB`,
			url: URL.createObjectURL(f),
		}));
		onUpdate({ materials: [...(session.materials || []), ...newMaterials] });
	};

	const removeMaterial = (id) => {
		onUpdate({ materials: session.materials.filter((m) => m.id !== id) });
	};

	// Fungsi utama penerima data dari AddMaterialForm
	const handleAddMaterial = ({ type, url, files }) => {
		if (type === 'url' && url) {
			onUpdate({ videoUrl: url });
		} else if (type === 'video_file' && files) {
			onUpdate({ videoFileName: files[0].name });
		} else if (type === 'document' && files) {
			addMaterial(files);
		}
	};

	// Simulasi penyimpanan dengan efek loading
	const handleSave = (publishState) => {
		setIsSaving(true);
		setTimeout(() => {
			onUpdate({ published: publishState });
			setIsSaving(false);
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		}, 800);
	};

	const completionColorClass =
		session.stats?.completionRate >= 70
			? 'text-success bg-success-subtle'
			: session.stats?.completionRate >= 40
				? 'text-warning bg-warning-subtle'
				: 'text-danger bg-danger-subtle';

	return (
		<>
			<div
				className={`custom-card border transition-shadow ${isExpanded ? ' border-primary' : 'border-secondary-subtle'}`}
			>
				{/* Header Sesi */}
				<div
					className={`px-4 py-3 d-flex justify-content-between align-items-center ${isExpanded ? 'border-bottom' : ''}`}
					style={{
						cursor: 'pointer',
						transition: 'background-color 0.2s',
						borderColor: '#e2e8f0',
					}}
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<div className="d-flex align-items-center gap-3 flex-grow-1 text-truncate">
						<div className="custom-badge-number flex-shrink-0">{sessionNumber}</div>
						<div className="flex-grow-1 text-truncate">
							<div className="d-flex align-items-center gap-2 flex-wrap">
								<span
									className="text-dark"
									style={{ fontSize: '16px', fontWeight: 400 }}
								>
									{session.title || 'Sesi baru'}
								</span>
								{session.published ? (
									<Badge
										bg="success"
										className="d-flex align-items-center gap-1 rounded-pill fw-normal"
									>
										<CheckCircle size={12} /> Dipublikasikan
									</Badge>
								) : (
									<Badge
										bg="secondary"
										className="rounded-pill fw-normal bg-opacity-25 text-secondary border border-secondary-subtle"
									>
										Draft
									</Badge>
								)}
							</div>
							<p className="text-muted small mb-0 text-truncate">
								{session.date} {session.speaker && `• ${session.speaker}`}
							</p>
						</div>
					</div>

					<div className="d-flex align-items-center gap-3">
						{session.published && session.stats && (
							<div className="d-none d-md-flex align-items-center gap-3">
								<div className="d-flex align-items-center gap-1 small text-secondary">
									<Users size={16} /> <span>{session.stats.totalAccess}</span>
								</div>
								<Badge
									bg="transparent"
									className={`d-flex align-items-center gap-1 rounded-pill border ${completionColorClass}`}
								>
									<BarChart2 size={14} /> {session.stats.completionRate}% selesai
								</Badge>
							</div>
						)}
						<Button
							variant="link"
							className="p-0 text-muted d-flex align-items-center justify-content-center flex-shrink-0"
							style={{ width: '28px', height: '28px' }}
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
							onMouseLeave={(e) => (e.currentTarget.style.color = '')}
						>
							<Trash2 size={18} strokeWidth={1.5} />
						</Button>
						{isExpanded ? (
							<ChevronUp
								size={20}
								className="text-muted flex-shrink-0"
								strokeWidth={1.5}
							/>
						) : (
							<ChevronDown
								size={20}
								className="text-muted flex-shrink-0"
								strokeWidth={1.5}
							/>
						)}
					</div>
				</div>

				{/* Expanded Content */}
				<Collapse in={isExpanded}>
					<div>
						<div className="border-top p-4 d-flex flex-column gap-4 bg-white">
							{/* Komponen Daftar Materi */}
							<MaterialList
								session={session}
								onClearVideoUrl={() => onUpdate({ videoUrl: '' })}
								onClearVideoFile={() => onUpdate({ videoFileName: null })}
								onRemoveDocument={removeMaterial}
								onPreviewMaterial={setPreviewMaterial}
							/>

							{/* Komponen Form Tambah Materi */}
							<AddMaterialForm onSave={handleAddMaterial} />
						</div>

						{/* --- Footer Action Bar --- */}
						<div className="p-3 border-top rounded-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
							{/* Tempat Footer Actions Anda ... */}
						</div>
					</div>
				</Collapse>
			</div>

			{/* Modals */}
			{previewMaterial && (
				<FilePreviewModal
					material={previewMaterial}
					onClose={() => setPreviewMaterial(null)}
				/>
			)}
			{showVideoPreview && session.videoUrl && (
				<VideoPreviewModal
					url={session.videoUrl}
					onClose={() => setShowVideoPreview(false)}
				/>
			)}
		</>
	);
};

export default SessionContentCard;
