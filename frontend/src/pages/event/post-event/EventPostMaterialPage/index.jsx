import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Button, Collapse, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import {
	Video, FileText, ChevronDown, ChevronRight, Eye, EyeOff,
	CheckCircle, Users, BarChart2, Play, Download, Trash2,
	Plus, Upload, Link as LinkIcon, BookOpen, Inbox, X, Check,
} from 'lucide-react';
import api from '@/api/axios';
import { notify } from '@/utils/notify';
import FormHeading from '@/components/dashboard/FormHeading';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import { Skeleton, SkeletonStyles } from '@/components/Skeleton';
import '@/components/dashboard/StatCard.css';

// ========================
// Sub-komponen: Badge status sesi
// ========================
const StatusBadge = ({ published }) => (
	<span
		className="d-inline-flex align-items-center gap-1 fw-semibold rounded-pill"
		style={{
			fontSize: '11.5px',
			padding: '4px 12px',
			backgroundColor: published ? '#dcfce7' : '#f1f5f9',
			color: published ? '#15803d' : '#64748b',
			whiteSpace: 'nowrap',
		}}
	>
		{published ? <Eye size={11} /> : <EyeOff size={11} />}
		{published ? 'Published' : 'Draft'}
	</span>
);

// ========================
// Sub-komponen: Material item row
// ========================
const MaterialRow = ({ material, onDelete }) => {
	const isVideo = material.type === 'url' || material.type === 'video_file';
	const isUrl = material.type === 'url';
	return (
		<div
			className="d-flex align-items-center gap-3 p-3 rounded-3"
			style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
		>
			<div
				className="d-flex align-items-center justify-content-center flex-shrink-0"
				style={{
					width: 36, height: 36, borderRadius: 10,
					backgroundColor: isVideo ? '#ede9fe' : '#dff3ff',
					color: isVideo ? '#5b21b6' : '#00699e',
				}}
			>
				{isVideo ? <Video size={16} /> : <FileText size={16} />}
			</div>
			<div className="flex-grow-1 text-truncate">
				<p className="mb-0 fw-medium text-dark text-truncate" style={{ fontSize: '13px' }}>
					{material.name || (isUrl ? 'Tautan Video Replay' : material.filename || 'Dokumen')}
				</p>
				{isUrl && (
					<a href={material.url} target="_blank" rel="noreferrer" className="text-secondary" style={{ fontSize: '11.5px' }}>
						{material.url?.slice(0, 50)}...
					</a>
				)}
			</div>
			<button
				className="btn d-flex align-items-center justify-content-center flex-shrink-0"
				style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#b91c1c', padding: 0 }}
				onClick={() => onDelete(material.id)}
				title="Hapus"
			>
				<Trash2 size={13} />
			</button>
		</div>
	);
};

// ========================
// Sub-komponen: Card per sesi
// ========================
const SessionCard = ({ session, sessionNumber, onUpdate, onRefresh }) => {
	const { eventId } = useParams();
	const [isOpen, setIsOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Upload / link state
	const [activeTab, setActiveTab] = useState('video'); // 'video' | 'document'
	const [videoUrl, setVideoUrl] = useState('');
	const [videoFile, setVideoFile] = useState(null);
	const [docFiles, setDocFiles] = useState([]);
	const [deleteTarget, setDeleteTarget] = useState(null);

	const hasMaterials = !!(session.videoUrl || session.videoFileName || (session.materials?.length > 0));
	const completionRate = session.stats?.completionRate || 0;
	const completionColor = completionRate >= 70 ? '#15803d' : completionRate >= 40 ? '#b45309' : '#b91c1c';
	const completionBg = completionRate >= 70 ? '#dcfce7' : completionRate >= 40 ? '#fef3c7' : '#fee2e2';

	const handleTogglePublish = async () => {
		setIsSaving(true);
		try {
			const res = await api.put(`event-dashboard/${eventId}/post-event/sessions/${session.id}/status`, {
				published: !session.published,
			});
			if (res.data?.status === 'success') {
				onUpdate({ published: !session.published });
				notify('success', 'Berhasil', res.data.message || 'Status sesi diperbarui.');
			}
		} catch (e) {
			notify('error', 'Gagal', e.response?.data?.message || 'Gagal mengubah status.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddVideo = async () => {
		if (!videoUrl.trim()) return;
		setIsSaving(true);
		try {
			await api.post(`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`, {
				type: 'url', url: videoUrl, name: 'Video Replay',
			});
			notify('success', 'Berhasil', 'Tautan video replay disimpan.');
			setVideoUrl('');
			onRefresh(true);
		} catch (e) {
			notify('error', 'Gagal', 'Gagal menyimpan tautan video.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleUploadVideoFile = async () => {
		if (!videoFile) return;
		setIsSaving(true);
		const fd = new FormData();
		fd.append('type', 'video_file');
		fd.append('file', videoFile);
		fd.append('name', videoFile.name);
		try {
			await api.post(`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`, fd, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			notify('success', 'Berhasil', 'Video replay berhasil diunggah.');
			setVideoFile(null);
			onRefresh(true);
		} catch (e) {
			notify('error', 'Gagal', 'Gagal mengunggah video.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleUploadDocs = async () => {
		if (docFiles.length === 0) return;
		setIsSaving(true);
		try {
			for (const f of docFiles) {
				const fd = new FormData();
				fd.append('type', 'document');
				fd.append('file', f);
				fd.append('name', f.name);
				await api.post(`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials`, fd, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			}
			notify('success', 'Berhasil', `${docFiles.length} dokumen berhasil diunggah.`);
			setDocFiles([]);
			onRefresh(true);
		} catch (e) {
			notify('error', 'Gagal', 'Gagal mengunggah dokumen.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteMaterial = async (materialId) => {
		try {
			await api.delete(`event-dashboard/${eventId}/post-event/sessions/${session.id}/materials/${materialId}`);
			notify('success', 'Dihapus', 'Materi berhasil dihapus.');
			setDeleteTarget(null);
			onRefresh(true);
		} catch (e) {
			notify('error', 'Gagal', 'Gagal menghapus materi.');
		}
	};

	return (
		<div
			className="bg-white overflow-hidden"
			style={{
				border: '1px solid #e2e8f0',
				borderLeft: `4px solid ${isOpen ? '#00699e' : '#cbd5e1'}`,
				borderRadius: '14px',
				transition: 'border-color 0.2s ease',
			}}
		>
			{/* Card Header */}
			<div
				className="px-4 py-3 d-flex align-items-center justify-content-between gap-3"
				style={{ cursor: 'pointer', backgroundColor: isOpen ? '#f8fafc' : 'transparent', transition: 'background-color 0.15s' }}
				onClick={() => setIsOpen(!isOpen)}
			>
				{/* Session number + info */}
				<div className="d-flex align-items-center gap-3 flex-grow-1 text-truncate">
					<div
						className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
						style={{
							width: 40, height: 40, borderRadius: 12,
							backgroundColor: isOpen ? '#dff3ff' : '#f1f5f9',
							color: isOpen ? '#00699e' : '#64748b',
							fontSize: '15px', transition: 'all 0.2s',
						}}
					>
						{sessionNumber}
					</div>
					<div className="text-truncate">
						<p className="mb-0 fw-semibold text-dark" style={{ fontSize: '14px', letterSpacing: '-0.2px' }}>
							{session.title || `Sesi ${sessionNumber}`}
						</p>
						<p className="mb-0 text-secondary text-truncate" style={{ fontSize: '12px' }}>
							{session.date && <span>{session.date}</span>}
							{session.speaker && <span className="ms-2">🎤 {session.speaker}</span>}
							{!session.date && !session.speaker && <span>Klik untuk kelola konten</span>}
						</p>
					</div>
				</div>

				{/* Right: Stats + status + chevron */}
				<div className="d-flex align-items-center gap-3 flex-shrink-0">
					{session.published && session.stats && (
						<div className="d-none d-md-flex align-items-center gap-3">
							<span className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '12.5px' }}>
								<Users size={13} /> <span className="fw-medium">{session.stats.totalAccess}</span>
							</span>
							<span
								className="d-flex align-items-center gap-1 fw-semibold rounded-pill"
								style={{ fontSize: '11.5px', padding: '3px 10px', backgroundColor: completionBg, color: completionColor }}
							>
								<BarChart2 size={12} /> {completionRate}% selesai
							</span>
						</div>
					)}
					<StatusBadge published={session.published} />
					<div style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
						<ChevronDown size={18} className="text-secondary" />
					</div>
				</div>
			</div>

			{/* Expandable Content */}
			<Collapse in={isOpen}>
				<div>
					<div className="px-4 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
						{/* Tab switcher */}
						<div className="d-flex gap-2 mb-4">
							{[
								{ key: 'video', label: 'Video Replay', icon: <Video size={13} /> },
								{ key: 'document', label: 'Dokumen', icon: <FileText size={13} /> },
							].map(tab => (
								<button
									key={tab.key}
									onClick={() => setActiveTab(tab.key)}
									className="d-flex align-items-center gap-2 fw-semibold"
									style={{
										border: activeTab === tab.key ? '1.5px solid #00699e' : '1.5px solid #e2e8f0',
										backgroundColor: activeTab === tab.key ? '#dff3ff' : '#f8fafc',
										color: activeTab === tab.key ? '#00699e' : '#64748b',
										borderRadius: '9px', padding: '6px 14px', fontSize: '12.5px',
										cursor: 'pointer', transition: 'all 0.15s',
									}}
								>
									{tab.icon} {tab.label}
								</button>
							))}
						</div>

						{/* Tab: Video Replay */}
						{activeTab === 'video' && (
							<div>
								{/* Existing video */}
								{(session.videoUrl || session.videoFileName) ? (
									<div className="mb-4">
										<p className="fw-semibold text-secondary mb-2" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
											Video Saat Ini
										</p>
										<div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}>
											<div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
												<Play size={16} />
											</div>
											<div className="flex-grow-1 text-truncate">
												<p className="mb-0 fw-medium text-dark" style={{ fontSize: '13px' }}>
													{session.videoFileName || 'Video Replay Tersedia'}
												</p>
												{session.videoUrl && (
													<a href={session.videoUrl} target="_blank" rel="noreferrer" className="text-secondary" style={{ fontSize: '11.5px' }}>
														{session.videoUrl.slice(0, 60)}...
													</a>
												)}
											</div>
											<button
												className="btn d-flex align-items-center justify-content-center"
												style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fca5a5', backgroundColor: '#fee2e2', color: '#b91c1c', padding: 0 }}
												onClick={() => setDeleteTarget({ id: session.videoMaterialId || session.videoFileMaterialId, label: 'video replay' })}
											>
												<Trash2 size={13} />
											</button>
										</div>
									</div>
								) : (
									<>
										{/* URL input */}
										<div className="mb-3">
											<label className="fw-semibold text-dark mb-1 d-block" style={{ fontSize: '13px' }}>
												Sematkan Tautan YouTube / Vimeo
											</label>
											<div className="d-flex gap-2">
												<div className="d-flex align-items-center gap-2 rounded-3 px-3 flex-grow-1" style={{ border: '1px solid #d1d5db', backgroundColor: '#fff' }}>
													<LinkIcon size={14} className="text-secondary flex-shrink-0" />
													<input
														type="url"
														value={videoUrl}
														onChange={e => setVideoUrl(e.target.value)}
														placeholder="https://youtube.com/watch?v=..."
														style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', padding: '8px 0' }}
													/>
												</div>
												<Button
													onClick={handleAddVideo}
													disabled={isSaving || !videoUrl.trim()}
													style={{ backgroundColor: '#00699e', border: 'none', borderRadius: '9px', fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap' }}
												>
													{isSaving ? <Spinner size="sm" /> : 'Simpan'}
												</Button>
											</div>
										</div>

										{/* Divider */}
										<div className="d-flex align-items-center gap-2 my-3">
											<hr className="flex-grow-1 m-0" style={{ borderColor: '#e2e8f0' }} />
											<span className="text-secondary fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>ATAU UNGGAH FILE</span>
											<hr className="flex-grow-1 m-0" style={{ borderColor: '#e2e8f0' }} />
										</div>

										{/* File upload */}
										{videoFile ? (
											<div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ backgroundColor: '#f0f9ff', border: '1.5px solid #7dd3fc' }}>
												<Video size={16} color="#0284c7" />
												<span className="flex-grow-1 fw-medium text-dark" style={{ fontSize: '13px' }}>{videoFile.name}</span>
												<button className="btn p-0 text-secondary" onClick={() => setVideoFile(null)}><X size={14} /></button>
												<Button
													onClick={handleUploadVideoFile}
													disabled={isSaving}
													style={{ backgroundColor: '#00699e', border: 'none', borderRadius: '8px', fontSize: '13px', padding: '6px 14px' }}
												>
													{isSaving ? <Spinner size="sm" /> : <><Check size={13} className="me-1" /> Unggah</>}
												</Button>
											</div>
										) : (
											<label
												className="d-flex flex-column align-items-center justify-content-center w-100 rounded-3 py-4 text-center"
												style={{ border: '1.5px dashed #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer', transition: 'background-color 0.15s' }}
												onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
												onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
											>
												<Upload size={20} color="#94a3b8" className="mb-2" />
												<span className="fw-semibold text-secondary" style={{ fontSize: '13px' }}>Klik untuk unggah file video</span>
												<span className="text-muted" style={{ fontSize: '11.5px' }}>MP4, MOV — Maks 500MB</span>
												<input type="file" accept="video/*" className="d-none" onChange={e => setVideoFile(e.target.files[0])} />
											</label>
										)}
									</>
								)}
							</div>
						)}

						{/* Tab: Dokumen */}
						{activeTab === 'document' && (
							<div>
								{/* Existing documents */}
								{session.materials && session.materials.filter(m => m.type === 'document').length > 0 && (
									<div className="mb-4">
										<p className="fw-semibold text-secondary mb-2" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
											Dokumen Tersedia ({session.materials.filter(m => m.type === 'document').length})
										</p>
										<div className="d-flex flex-column gap-2">
											{session.materials.filter(m => m.type === 'document').map(mat => (
												<MaterialRow
													key={mat.id}
													material={mat}
													onDelete={(id) => setDeleteTarget({ id, label: mat.name || 'dokumen' })}
												/>
											))}
										</div>
									</div>
								)}

								{/* Upload dokumen */}
								<div>
									<label className="fw-semibold text-dark mb-2 d-block" style={{ fontSize: '13px' }}>
										Tambah Dokumen Baru
									</label>
									{docFiles.length === 0 ? (
										<label
											className="d-flex flex-column align-items-center justify-content-center w-100 rounded-3 py-4 text-center"
											style={{ border: '1.5px dashed #7dd3fc', backgroundColor: '#f0f9ff', cursor: 'pointer', transition: 'background-color 0.15s' }}
											onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f2fe'}
											onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
										>
											<Upload size={20} color="#0284c7" className="mb-2" />
											<span className="fw-semibold text-dark" style={{ fontSize: '13px' }}>Klik atau seret file ke sini</span>
											<span className="text-secondary" style={{ fontSize: '11.5px' }}>PDF, PPT, DOCX — Bisa multi-file</span>
											<input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx" className="d-none" onChange={e => setDocFiles(Array.from(e.target.files))} />
										</label>
									) : (
										<div>
											<div className="d-flex flex-column gap-2 mb-3">
												{docFiles.map((f, i) => (
													<div key={i} className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
														<FileText size={14} color="#0284c7" />
														<span className="flex-grow-1 text-dark fw-medium" style={{ fontSize: '13px' }}>{f.name}</span>
														<button className="btn p-0 text-secondary" onClick={() => setDocFiles(docFiles.filter((_, idx) => idx !== i))}><X size={13} /></button>
													</div>
												))}
											</div>
											<div className="d-flex gap-2">
												<Button
													variant="light"
													onClick={() => setDocFiles([])}
													style={{ borderRadius: '9px', fontSize: '13px', border: '1px solid #d1d5db' }}
												>
													Batal
												</Button>
												<Button
													onClick={handleUploadDocs}
													disabled={isSaving}
													style={{ backgroundColor: '#00699e', border: 'none', borderRadius: '9px', fontSize: '13px' }}
												>
													{isSaving ? <><Spinner size="sm" className="me-1" /> Menggunggah...</> : <><Check size={13} className="me-1" /> Unggah {docFiles.length} file</>}
												</Button>
											</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					<div
						className="px-4 py-3 d-flex align-items-center justify-content-end flex-wrap gap-3"
						style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px' }}
					>
						<Button
							onClick={handleTogglePublish}
							disabled={isSaving}
							className="d-flex align-items-center gap-2 fw-semibold"
							style={{
								backgroundColor: session.published ? 'transparent' : '#00699e',
								border: session.published ? '1.5px solid #d1d5db' : 'none',
								color: session.published ? '#64748b' : '#fff',
								borderRadius: '9px', fontSize: '13px', padding: '7px 18px',
							}}
						>
							{isSaving ? (
								<><Spinner size="sm" style={{ width: 13, height: 13, borderWidth: 2 }} /> Menyimpan...</>
							) : session.published ? (
								<><EyeOff size={14} /> Tarik ke Draft</>
							) : (
								<><Eye size={14} /> Terbitkan ke Peserta</>
							)}
						</Button>
					</div>
				</div>
			</Collapse>

			{/* Delete confirmation */}
			{deleteTarget && (
				<ConfirmationModal
					show
					onHide={() => setDeleteTarget(null)}
					onConfirm={() => handleDeleteMaterial(deleteTarget.id)}
					config={{
						title: 'Hapus Materi',
						desc: `Yakin ingin menghapus "${deleteTarget.label}"? Tindakan ini tidak dapat dibatalkan.`,
						icon: Trash2,
						iconColor: '#b91c1c',
						iconBg: '#fee2e2',
						iconBorder: '#fca5a5',
						btnVariant: 'danger',
					}}
				/>
			)}
		</div>
	);
};


// ========================
// Halaman Utama
// ========================
const EventPostMaterialPage = () => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useOutletContext() || {};
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchSessions = async (silent = false) => {
		try {
			if (!silent) {
				setLoading(true);
				if (setIsPageLoading) setIsPageLoading(true);
			}
			const res = await api.get(`event-dashboard/${eventId}/post-event/sessions`);
			if (res.data?.status === 'success') {
				setSessions(res.data.data);
			}
		} catch (e) {
			console.error('Gagal mengambil sesi:', e);
		} finally {
			if (!silent) {
				setLoading(false);
				if (setIsPageLoading) setIsPageLoading(false);
			}
		}
	};

	useEffect(() => {
		if (eventId) fetchSessions();
	}, [eventId]);

	const updateSession = (id, updates) =>
		setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));

	// Stats
	const published = sessions.filter(s => s.published);
	const totalAccess = published.reduce((a, s) => a + (s.stats?.totalAccess || 0), 0);
	const avgCompletion = published.length > 0
		? Math.round(published.reduce((a, s) => a + (s.stats?.completionRate || 0), 0) / published.length)
		: 0;

	if (loading) {
		return (
			<div>
				<SkeletonStyles />

				<div className="row g-3 mb-4">
					{[1, 2, 3].map(i => (
						<div key={i} className="col-md-4 col-sm-6">
							<div className="p-3 d-flex align-items-center gap-3 bg-white" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
								<Skeleton width="44px" height="44px" borderRadius="12px" />
								<div className="flex-grow-1">
									<Skeleton width="50%" height="12px" className="mb-2" />
									<Skeleton width="35%" height="22px" />
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="d-flex flex-column gap-3">
					{[1, 2, 3].map(i => (
						<div key={i} className="bg-white p-4" style={{ border: '1px solid #e2e8f0', borderRadius: '14px' }}>
							<div className="d-flex align-items-center gap-3">
								<Skeleton width="40px" height="40px" borderRadius="10px" />
								<div className="flex-grow-1">
									<Skeleton width="40%" height="14px" className="mb-2" />
									<Skeleton width="25%" height="11px" />
								</div>
								<Skeleton width="80px" height="26px" borderRadius="20px" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container-fluid p-0">
			<FormHeading
				title="Manajemen Materi Acara"
				description="Kelola rekaman video replay, slide presentasi, dan dokumen pembelajaran yang dibagikan kepada peserta setelah sesi berakhir."
				className="mb-4"
			/>
			{/* Stat Cards */}
			{sessions.length > 0 && (
				<div className="row g-3 mb-4">
					{[
						{ label: 'Total Sesi', value: sessions.length, bg: '#dff3ff', color: '#00699e', icon: BookOpen },
						{ label: 'Dipublikasikan', value: published.length, bg: '#dcfce7', color: '#166534', icon: Eye },
						{ label: 'Total Akses', value: totalAccess, bg: '#ede9fe', color: '#5b21b6', icon: Users },
						{ label: 'Rata-rata Selesai', value: `${avgCompletion}%`, bg: '#fef3c7', color: '#92400e', icon: BarChart2 },
					].map(({ label, value, bg, color, icon: Icon }) => (
						<div key={label} className="col-md-3 col-sm-6">
							<div className="stat-card-modern p-3 d-flex align-items-center gap-3" style={{ border: '1px solid #e2e8f0' }}>
								<div className="icon-wrapper d-flex align-items-center justify-content-center" style={{ backgroundColor: bg, color }}>
									<Icon size={20} />
								</div>
								<div>
									<p className="stat-value fw-bold text-dark mb-0">{value}</p>
									<p className="stat-label text-uppercase text-muted mb-0">{label}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Empty State */}
			{sessions.length === 0 ? (
				<div
					className="d-flex flex-column align-items-center justify-content-center text-center py-5"
					style={{ border: '1px dashed #cbd5e1', borderRadius: '16px', backgroundColor: '#f8fafc', minHeight: '280px' }}
				>
					<div
						className="d-flex align-items-center justify-content-center mb-3"
						style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: '#dff3ff', color: '#00699e' }}
					>
						<Video size={26} />
					</div>
					<h6 className="fw-bold text-dark mb-1">Belum Ada Sesi Ditemukan</h6>
					<p className="text-muted small mb-0" style={{ maxWidth: 340 }}>
						Pastikan sesi acara sudah dibuat di menu <strong>Sesi</strong> terlebih dahulu. Konten pasca-acara akan muncul di sini setelah sesi tersedia.
					</p>
				</div>
			) : (
				<div className="d-flex flex-column gap-3">
					{sessions.map((session, i) => (
						<SessionCard
							key={session.id}
							session={session}
							sessionNumber={i + 1}
							onUpdate={(updates) => updateSession(session.id, updates)}
							onRefresh={fetchSessions}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default EventPostMaterialPage;
