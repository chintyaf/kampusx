import React, { useState } from 'react';
import { Card, Badge, Button, Collapse, Spinner } from 'react-bootstrap';
import { ChevronDown, Trash2, CheckCircle, Users, BarChart2, ChevronUp } from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';
import VideoPreviewModal from './VideoPreviewModal';
import MaterialList from './MaterialList';
import AddMaterialForm from './AddMaterialForm';
import api from '../../../../api/axios';
import { useParams } from 'react-router-dom';
import { notify } from '../../../../utils/notify';

const SessionContentCard = ({ session, sessionNumber, onUpdate, onDelete, onRefresh, hasPreviousSession }) => {
	const { eventId } = useParams();
	const [isExpanded, setIsExpanded] = useState(false);
	const [previewMaterial, setPreviewMaterial] = useState(null);
	const [showVideoPreview, setShowVideoPreview] = useState(false);

	// State untuk simulasi loading UI
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const handleDeleteMaterial = async (materialId) => {
		try {
			setIsSaving(true);
			const res = await api.delete(`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials/${materialId}`);
			if (res.data?.status === 'success') {
				onRefresh();
				notify('success', 'Berhasil', 'Materi berhasil dihapus.');
			}
		} catch (error) {
			console.error("Gagal menghapus materi:", error);
			notify('error', 'Gagal', error.response?.data?.message || 'Gagal menghapus materi.');
		} finally {
			setIsSaving(false);
		}
	};

	// Fungsi utama penerima data dari AddMaterialForm
	const handleAddMaterial = async ({ type, url, files }) => {
		try {
			setIsSaving(true);
			if (type === 'url') {
				if (!url) return;
				const res = await api.post(`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`, {
					type: 'url',
					url: url,
					name: 'YouTube Replay'
				});
				if (res.data?.status === 'success') {
					onRefresh();
					notify('success', 'Berhasil', 'Tautan replay video disimpan.');
				}
			} else if (type === 'video_file' && files && files.length > 0) {
				const file = files[0];
				const formData = new FormData();
				formData.append('type', 'video_file');
				formData.append('file', file);
				formData.append('name', file.name);

				const res = await api.post(`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				if (res.data?.status === 'success') {
					onRefresh();
					notify('success', 'Berhasil', 'Video replay berhasil diunggah.');
				}
			} else if (type === 'document' && files && files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					const formData = new FormData();
					formData.append('type', 'document');
					formData.append('file', file);
					formData.append('name', file.name);

					await api.post(`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`, formData, {
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					});
				}
				onRefresh();
				notify('success', 'Berhasil', 'Dokumen berhasil diunggah.');
			}
		} catch (error) {
			console.error("Gagal mengunggah materi:", error);
			notify('error', 'Gagal', error.response?.data?.message || 'Gagal menyimpan materi.');
		} finally {
			setIsSaving(false);
		}
	};

	// Simpan Draft / Publikasikan
	const handleSave = async (publishState) => {
		setIsSaving(true);
		try {
			const response = await api.put(`event-dashboard/${eventId}/post-event/sessions/${session.id}/status`, {
				published: publishState,
			});
			if (response.data?.status === 'success') {
				onUpdate({ published: publishState });
				setSaveSuccess(true);
				setTimeout(() => setSaveSuccess(false), 3000);
				notify('success', 'Berhasil', response.data.message);
			}
		} catch (error) {
			console.error("Gagal memperbarui status sesi:", error);
			notify('error', 'Gagal', error.response?.data?.message || 'Gagal memperbarui status.');
		} finally {
			setIsSaving(false);
		}
	};

	const getCompletionStyle = (rate) => {
		if (rate >= 70) {
			return {
				backgroundColor: '#dcfce7',
				color: '#15803d',
			};
		}
		if (rate >= 40) {
			return {
				backgroundColor: '#fef3c7',
				color: '#b45309',
			};
		}
		return {
			backgroundColor: '#fee2e2',
			color: '#b91c1c',
		};
	};

	const completionStyle = getCompletionStyle(session.stats?.completionRate || 0);

	return (
		<>
			<div
				className="custom-card border"
				style={{
					boxShadow: 'none',
					border: isExpanded ? '1px solid #00699e' : '1px solid #e2e8f0',
					borderRadius: '12px',
					backgroundColor: '#ffffff',
					transition: 'border-color 0.2s, background-color 0.2s',
				}}
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
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = '#f8fafc';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = '';
					}}
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
										bg="transparent"
										className="d-flex align-items-center gap-1 rounded-pill fw-normal border-0"
										style={{
											backgroundColor: '#dcfce7',
											color: '#15803d',
											padding: '4px 10px',
										}}
									>
										<CheckCircle size={12} style={{ color: '#15803d' }} /> Dipublikasikan
									</Badge>
								) : (
									<Badge
										bg="transparent"
										className="rounded-pill fw-normal border-0"
										style={{
											backgroundColor: '#f1f5f9',
											color: '#475569',
											padding: '4px 10px',
										}}
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
									className="d-flex align-items-center gap-1 rounded-pill border-0"
									style={{
										...completionStyle,
										padding: '4px 10px',
									}}
								>
									<BarChart2 size={14} style={{ color: completionStyle.color }} /> {session.stats.completionRate}% selesai
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
								onClearVideoUrl={async () => {
									if (session.videoMaterialId) {
										await handleDeleteMaterial(session.videoMaterialId);
									}
								}}
								onClearVideoFile={async () => {
									if (session.videoFileMaterialId) {
										await handleDeleteMaterial(session.videoFileMaterialId);
									}
								}}
								onRemoveDocument={handleDeleteMaterial}
								onPreviewMaterial={setPreviewMaterial}
							/>

							{/* Komponen Form Tambah Materi */}
							<AddMaterialForm onSave={handleAddMaterial} />
						</div>

						{/* --- Footer Action Bar --- */}
						<div 
							className="p-3 border-top rounded-bottom d-flex align-items-center justify-content-between flex-wrap gap-3"
							style={{ backgroundColor: '#f8fafc' }}
						>
							<div className="text-muted small">
								{saveSuccess ? (
									<span className="text-success d-flex align-items-center gap-1">
										<CheckCircle size={14} /> Tersimpan
									</span>
								) : isSaving ? (
									<span className="d-flex align-items-center gap-1">
										<Spinner animation="border" size="sm" style={{ width: '12px', height: '12px' }} /> Menyimpan...
									</span>
								) : (
									<span>Status: <strong>{session.published ? 'Dipublikasikan' : 'Draft'}</strong></span>
								)}
							</div>
							<div className="d-flex gap-2">
								{session.published ? (
									<Button
										variant="outline-secondary"
										size="sm"
										className="small"
										disabled={isSaving}
										onClick={() => handleSave(false)}
									>
										Ubah ke Draft
									</Button>
								) : (
									<>
										<Button
											variant="light"
											size="sm"
											className="border border-secondary-subtle small bg-white text-dark"
											disabled={isSaving}
											onClick={() => handleSave(false)}
										>
											Simpan sebagai Draft
										</Button>
										<Button
											variant="primary"
											size="sm"
											className="small"
											disabled={isSaving}
											onClick={() => handleSave(true)}
										>
											Publikasikan Sesi
										</Button>
									</>
								)}
							</div>
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
