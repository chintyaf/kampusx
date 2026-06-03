import React, { useState } from 'react';
import { Badge, Button, Collapse, Spinner } from 'react-bootstrap';
import { ChevronDown, Trash2, CheckCircle, Users, BarChart2 } from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';
import VideoPreviewModal from './VideoPreviewModal';
import MaterialList from './MaterialList';
import AddMaterialForm from './AddMaterialForm';
import api from '../../../../../api/axios';
import { useParams } from 'react-router-dom';
import { notify } from '../../../../../utils/notify';

const SessionContentCard = ({
	session,
	sessionNumber,
	onUpdate,
	onDelete,
	onRefresh,
	hasPreviousSession,
}) => {
	const { eventId } = useParams();
	const [isExpanded, setIsExpanded] = useState(false);
	const [previewMaterial, setPreviewMaterial] = useState(null);
	const [showVideoPreview, setShowVideoPreview] = useState(false);

	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	const handleDeleteMaterial = async (materialId) => {
		try {
			setIsSaving(true);
			const res = await api.delete(
				`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials/${materialId}`,
			);
			if (res.data?.status === 'success') {
				onRefresh(true);
				notify('success', 'Berhasil', 'Materi berhasil dihapus.');
			}
		} catch (error) {
			console.error('Gagal menghapus materi:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Gagal menghapus materi.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddMaterial = async ({ type, url, files }) => {
		try {
			setIsSaving(true);
			if (type === 'url') {
				if (!url) return;
				const res = await api.post(
					`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`,
					{
						type: 'url',
						url: url,
						name: 'YouTube Replay',
					},
				);
				if (res.data?.status === 'success') {
					onRefresh(true);
					notify('success', 'Berhasil', 'Tautan replay video disimpan.');
				}
			} else if (type === 'video_file' && files && files.length > 0) {
				const file = files[0];
				const formData = new FormData();
				formData.append('type', 'video_file');
				formData.append('file', file);
				formData.append('name', file.name);

				const res = await api.post(
					`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`,
					formData,
					{
						headers: { 'Content-Type': 'multipart/form-data' },
					},
				);
				if (res.data?.status === 'success') {
					onRefresh(true);
					notify('success', 'Berhasil', 'Video replay berhasil diunggah.');
				}
			} else if (type === 'document' && files && files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					const formData = new FormData();
					formData.append('type', 'document');
					formData.append('file', file);
					formData.append('name', file.name);

					await api.post(
						`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`,
						formData,
						{
							headers: { 'Content-Type': 'multipart/form-data' },
						},
					);
				}
				onRefresh(true);
				notify('success', 'Berhasil', 'Dokumen berhasil diunggah.');
			}
		} catch (error) {
			console.error('Gagal mengunggah materi:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Gagal menyimpan materi.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleSave = async (publishState) => {
		setIsSaving(true);
		try {
			const response = await api.put(
				`event-dashboard/${eventId}/post-event/sessions/${session.id}/status`,
				{
					published: publishState,
				},
			);
			if (response.data?.status === 'success') {
				onUpdate({ published: publishState });
				setSaveSuccess(true);
				setTimeout(() => setSaveSuccess(false), 3000);
				notify('success', 'Berhasil', response.data.message);
			}
		} catch (error) {
			console.error('Gagal memperbarui status sesi:', error);
			notify('error', 'Gagal', error.response?.data?.message || 'Gagal memperbarui status.');
		} finally {
			setIsSaving(false);
		}
	};

	const getCompletionStyle = (rate) => {
		if (rate >= 70) return { backgroundColor: '#dcfce7', color: '#15803d' };
		if (rate >= 40) return { backgroundColor: '#fef3c7', color: '#b45309' };
		return { backgroundColor: '#fee2e2', color: '#b91c1c' };
	};

	const completionStyle = getCompletionStyle(session.stats?.completionRate || 0);

	return (
		<div className="mb-4">
			<div
				style={{
					backgroundColor: '#ffffff',
					border: '1px solid #e2e8f0' /* Border dibuat solid abu-abu konsisten */,
					borderRadius: '12px',
					transition: 'all 0.2s ease-in-out',
					overflow: 'hidden',
				}}
			>
				{/* Header Sesi */}
				<div
					className="p-4 d-flex justify-content-between align-items-center"
					style={{
						cursor: 'pointer',
						backgroundColor: isExpanded ? '#f8fafc' : 'transparent',
						transition: 'background-color 0.2s ease',
					}}
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<div className="d-flex align-items-center gap-3 flex-grow-1 text-truncate">
						{/* Number Indicator */}
						<div
							className="d-flex align-items-center justify-content-center flex-shrink-0"
							style={{
								width: '38px',
								height: '38px',
								backgroundColor: isExpanded ? '#e0f2fe' : '#f1f5f9',
								color: isExpanded ? '#00699e' : '#475569',
								borderRadius: '10px',
								fontWeight: '600',
								fontSize: '15px',
								transition: 'all 0.2s ease',
							}}
						>
							{sessionNumber}
						</div>

						<div className="flex-grow-1 text-truncate">
							<div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
								<span
									className="text-dark"
									style={{
										fontSize: '16px',
										fontWeight: 500,
										letterSpacing: '-0.3px',
									}}
								>
									{session.title || 'Sesi Baru'}
								</span>
							</div>
							<p
								className="text-muted small mb-0 text-truncate"
								style={{ fontSize: '13px' }}
							>
								{session.date} {session.speaker && <span className="mx-1">•</span>}{' '}
								{session.speaker}
							</p>
						</div>
					</div>

					{/* Stats & Actions */}
					<div className="d-flex align-items-center gap-4">
						{session.published && session.stats && (
							<div
								className="d-none d-md-flex align-items-center gap-3 border-end pe-4"
								style={{ borderColor: '#e2e8f0' }}
							>
								<div className="d-flex align-items-center gap-1.5 small text-secondary">
									<Users size={15} strokeWidth={2} />{' '}
									<span className="fw-medium">{session.stats.totalAccess}</span>
								</div>
								<Badge
									bg="transparent"
									className="d-flex align-items-center gap-1.5 rounded-pill border-0 fw-medium"
									style={{
										...completionStyle,
										padding: '5px 12px',
										fontSize: '12px',
									}}
								>
									<BarChart2
										size={14}
										strokeWidth={2.5}
										style={{ color: completionStyle.color }}
									/>
									{session.stats.completionRate}% selesai
								</Badge>
							</div>
						)}
						<Button
							variant="link"
							className="p-0 text-secondary d-flex align-items-center justify-content-center"
							style={{ width: '32px', height: '32px', transition: 'color 0.2s ease' }}
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
							onMouseLeave={(e) => (e.currentTarget.style.color = '')}
						>
							<Trash2 size={18} strokeWidth={1.5} />
						</Button>
						<div
							className="text-secondary"
							style={{
								transition: 'transform 0.3s ease',
								transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
							}}
						>
							<ChevronDown size={20} strokeWidth={1.5} />
						</div>
					</div>
				</div>

				{/* Expanded Content Area */}
				<Collapse in={isExpanded}>
					<div>
						<div
							className="border-top p-4 d-flex flex-column gap-4 bg-white"
							style={{ borderColor: '#e2e8f0' }}
						>
							<MaterialList
								session={session}
								onClearVideoUrl={async () => {
									if (session.videoMaterialId)
										await handleDeleteMaterial(session.videoMaterialId);
								}}
								onClearVideoFile={async () => {
									if (session.videoFileMaterialId)
										await handleDeleteMaterial(session.videoFileMaterialId);
								}}
								onRemoveDocument={handleDeleteMaterial}
								onPreviewMaterial={setPreviewMaterial}
							/>
							<AddMaterialForm onSave={handleAddMaterial} isSaving={isSaving} />
						</div>

						{/* Flat Footer Action Bar */}
						<div
							className="px-4 py-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-3"
							style={{
								backgroundColor: '#f8fafc',
								borderBottomLeftRadius: '12px',
								borderBottomRightRadius: '12px',
								borderColor: '#e2e8f0',
							}}
						>
							<div
								className="d-flex align-items-center gap-2 text-secondary"
								style={{ fontSize: '13px' }}
							>
								<CheckCircle size={16} className="text-success" />
								<span>
									Materi otomatis tersedia setelah acara selesai bagi peserta yang
									hadir dan telah mengisi survey.
								</span>
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
		</div>
	);
};

export default SessionContentCard;
