import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button, Badge, Row, Col, Collapse } from 'react-bootstrap';
import { ChevronDown, PlayCircle, Video, BarChart2, Users, Download, Eye, Link2, FileText, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { STORAGE_URL } from '../../api/storage';
import StatCard from '@/components/dashboard/StatCard';
import { Skeleton, SkeletonStyles } from '@/components/Skeleton';
import FilePreviewModal from '@/pages/event/post-event/EventPostMaterialPage/components/FilePreviewModal';
import VideoPreviewModal from '@/pages/event/post-event/EventPostMaterialPage/components/VideoPreviewModal';
import { getFileIcon } from '@/pages/event/post-event/EventPostMaterialPage/components/utils';

const ParticipantMaterialsTab = ({ eventId }) => {
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState(null);
	const [expandedSessionId, setExpandedSessionId] = useState(null);

	// Modal states
	const [previewMaterial, setPreviewMaterial] = useState(null);
	const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

	const fetchSessions = async () => {
		setLoading(true);
		setErrorMsg(null);
		try {
			const res = await api.get(`/events/${eventId}/post-event/sessions`);
			if (res.data?.status === 'success') {
				setSessions(res.data.data || []);
			}
		} catch (err) {
			console.error("Gagal memuat materi sesi pasca-acara:", err);
			if (err.response?.status === 403) {
				setErrorMsg("Akses ditolak. Anda tidak terdaftar sebagai peserta atau belum memiliki akses ke halaman ini.");
			} else {
				setErrorMsg("Gagal mengambil data materi sesi pasca-acara.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (eventId) {
			fetchSessions();
		}
	}, [eventId]);

	const toggleSession = (id) => {
		setExpandedSessionId(expandedSessionId === id ? null : id);
	};

	// --- Logika Kalkulasi Statistik ---
	const totalSessions = sessions.length;
	const totalPublished = sessions.filter((s) => s.published).length;

	// Total partisipan yang mengakses
	const totalAccess = sessions.reduce(
		(acc, curr) => acc + (curr.stats?.totalAccess || 0),
		0,
	);

	// Total unduhan file materi
	const totalDownloads = sessions.reduce(
		(acc, curr) => acc + (curr.stats?.downloadCount || 0),
		0,
	);

	// Rata-rata tingkat penyelesaian (Completion Rate)
	const avgCompletion =
		totalSessions > 0
			? Math.round(
				sessions.reduce(
					(acc, curr) => acc + (curr.stats?.completionRate || 0),
					0,
				) / totalSessions,
			)
			: 0;

	if (loading) {
		return (
			<div>
				<SkeletonStyles />
				<div className="mb-4">
					<Skeleton width="250px" height="24px" className="mb-2" />
					<Skeleton width="450px" height="16px" />
				</div>

				{/* Stat Cards Skeletons */}
				<div className="row g-3 mb-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="col-md-3 col-sm-6">
							<div
								className="p-3 d-flex align-items-center gap-3 bg-white"
								style={{
									border: '1px solid #e2e8f0',
									borderRadius: '10px',
								}}
							>
								<Skeleton width="40px" height="40px" borderRadius="10px" />
								<div className="flex-grow-1">
									<Skeleton width="60%" height="12px" className="mb-2" />
									<Skeleton width="40%" height="20px" />
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Sessions Skeletons */}
				<div className="d-flex flex-column gap-3">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="p-4 bg-white"
							style={{
								border: '1px solid #e2e8f0',
								borderRadius: '12px',
							}}
						>
							<div className="d-flex justify-content-between align-items-center">
								<div className="d-flex align-items-center gap-3">
									<Skeleton width="32px" height="32px" borderRadius="8px" />
									<div>
										<Skeleton width="200px" height="16px" className="mb-2" />
										<Skeleton width="120px" height="12px" />
									</div>
								</div>
								<Skeleton width="24px" height="24px" borderRadius="50%" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (errorMsg) {
		return (
			<Alert variant="danger" className="border-0 shadow-sm rounded-4 p-4 d-flex align-items-center gap-3">
				<div className="bg-danger bg-opacity-10 text-danger rounded-circle p-2.5 d-inline-flex">
					<FileText size={24} />
				</div>
				<div>
					<h6 className="fw-bold text-dark mb-1">Materi Privat Terkunci</h6>
					<p className="mb-0 text-muted small">{errorMsg}</p>
				</div>
			</Alert>
		);
	}

	if (sessions.length === 0) {
		return (
			<div className="text-center py-5 bg-white rounded-4 border border-dashed shadow-sm">
				<FileText size={48} className="opacity-25 mb-3 text-secondary mx-auto" />
				<h5 className="fw-bold text-dark mb-1">Belum Ada Materi Diterbitkan</h5>
				<p className="small text-muted mb-0 mx-auto" style={{ maxWidth: '350px' }}>
					Penyelenggara belum merilis materi pasca-acara atau slide pembelajaran untuk event ini.
				</p>
			</div>
		);
	}

	return (
		<div className="participant-materials-container fade-in">
			<div className="mb-4">
				<h5 className="fw-bold mb-1" style={{ color: 'var(--color-primary, #1A365D)' }}>
					Materi Pasca-Acara & Video Replay
				</h5>
				<p className="text-muted small mb-0">
					Akses rekaman video sesi, slide presentasi pemateri, dan dokumen pendukung seminar lainnya.
				</p>
			</div>

			{/* --- Bagian Stat Cards --- */}
			{/* <div className="row g-3 mb-4">
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={Video}
						label="Sesi Tersedia"
						value={`${totalPublished} Sesi`}
						type="blue"
						iconColor="#475569"
						iconBg="#f1f5f9"
						style={{
							boxShadow: 'none',
							border: '1px solid #e2e8f0',
							backgroundColor: '#ffffff',
						}}
					/>
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={Users}
						label="Total Akses"
						value={totalAccess}
						type="green"
						iconColor="#475569"
						iconBg="#f1f5f9"
						style={{
							boxShadow: 'none',
							border: '1px solid #e2e8f0',
							backgroundColor: '#ffffff',
						}}
					/>
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={BarChart2}
						label="Rata-rata Selesai"
						value={`${avgCompletion}%`}
						type="yellow"
						iconColor="#475569"
						iconBg="#f1f5f9"
						style={{
							boxShadow: 'none',
							border: '1px solid #e2e8f0',
							backgroundColor: '#ffffff',
						}}
					/>
				</div>
				<div className="col-md-3 col-sm-6">
					<StatCard
						Icon={Download}
						label="Total Unduhan"
						value={totalDownloads}
						type="red"
						iconColor="#475569"
						iconBg="#f1f5f9"
						style={{
							boxShadow: 'none',
							border: '1px solid #e2e8f0',
							backgroundColor: '#ffffff',
						}}
					/>
				</div>
			</div> */}

			{/* --- List of Sessions --- */}
			<div className="d-flex flex-column gap-3">
				{sessions.map((session, index) => {
					const isExpanded = expandedSessionId === session.id;
					const hasMaterials = session.videoUrl || session.videoFileName || (session.materials && session.materials.length > 0);

					return (
						<div
							key={session.id}
							style={{
								backgroundColor: '#ffffff',
								border: '1px solid #e2e8f0',
								borderRadius: '12px',
								transition: 'all 0.2s ease-in-out',
								overflow: 'hidden',
							}}
						>
							{/* Session Card Header */}
							<div
								className="p-4 d-flex justify-content-between align-items-center"
								style={{
									cursor: hasMaterials ? 'pointer' : 'default',
									backgroundColor: isExpanded ? '#f8fafc' : 'transparent',
									transition: 'background-color 0.2s ease',
								}}
								onClick={() => hasMaterials && toggleSession(session.id)}
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
										{index + 1}
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
												{session.title || 'Sesi Acara'}
											</span>
										</div>
										<p
											className="text-muted small mb-0 text-truncate"
											style={{ fontSize: '13px' }}
										>
											{session.date} {session.speakers && <span className="mx-1">•</span>}{' '}
											{session.speakers}
										</p>
									</div>
								</div>

								{/* Right indicator */}
								<div className="d-flex align-items-center gap-3">
									{!hasMaterials ? (
										<Badge bg="secondary-subtle" text="secondary" className="px-2.5 py-1.5 rounded-pill border small" style={{ fontWeight: 'normal' }}>
											Materi Belum Tersedia
										</Badge>
									) : (
										<div
											className="text-secondary"
											style={{
												transition: 'transform 0.3s ease',
												transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
											}}
										>
											<ChevronDown size={20} strokeWidth={1.5} />
										</div>
									)}
								</div>
							</div>

							{/* Session Card Expanded Panel */}
							{hasMaterials && (
								<Collapse in={isExpanded}>
									<div>
										<div
											className="border-top p-4 d-flex flex-column gap-3 bg-white"
											style={{ borderColor: '#e2e8f0' }}
										>
											{/* Video Replay URL Link */}
											{session.videoUrl && (
												<div
													className="d-flex justify-content-between align-items-center p-3 rounded"
													style={{
														backgroundColor: '#f8fafc',
														border: '1px solid #f1f5f9',
													}}
												>
													<div className="d-flex align-items-center gap-2.5 text-dark small fw-medium text-truncate me-3">
														<PlayCircle size={18} className="text-danger flex-shrink-0" />
														<span className="text-truncate">Video Replay Sesi (Tautan Luar)</span>
													</div>
													<Button
														variant="danger"
														size="sm"
														className="rounded-pill px-3.5 py-1.5 small fw-semibold shadow-sm d-flex align-items-center gap-1.5"
														style={{ fontSize: '12px' }}
														onClick={() => setVideoPreviewUrl(session.videoUrl)}
													>
														<PlayCircle size={14} /> Tonton Video
													</Button>
												</div>
											)}

											{/* Video Replay Upload File */}
											{session.videoFileName && (
												<div
													className="d-flex justify-content-between align-items-center p-3 rounded"
													style={{
														backgroundColor: '#f8fafc',
														border: '1px solid #f1f5f9',
													}}
												>
													<div className="d-flex align-items-center gap-2.5 text-dark small fw-medium text-truncate me-3">
														<Video size={18} className="text-primary flex-shrink-0" />
														<span className="text-truncate">{session.videoFileName}</span>
													</div>
													<Button
														variant="primary"
														size="sm"
														className="rounded-pill px-3.5 py-1.5 small fw-semibold shadow-sm d-flex align-items-center gap-1.5"
														style={{ fontSize: '12px' }}
														onClick={() => {
															// Create mock material object for video file to preview using FilePreviewModal
															const videoFileUrl = !filterVarUrl(session.videoFileName) && session.videoFileMaterialId
																? `${STORAGE_URL}/materials/sessions/${session.id}/video_file/${session.videoFileName}`
																: session.videoFileName;
															setPreviewMaterial({
																id: session.videoFileMaterialId,
																name: session.videoFileName,
																type: 'video',
																url: `${STORAGE_URL}/materials/sessions/${session.id}/video_file/${session.videoFileName}`, // fallback absolute link
																size: 'Video File'
															});
														}}
													>
														<PlayCircle size={14} /> Putar Video
													</Button>
												</div>
											)}

											{/* Document Materials List */}
											{session.materials && session.materials.length > 0 && (
												<div className="d-flex flex-column gap-2 mt-1">
													<div className="fw-semibold text-secondary small mb-1">Dokumen & Slide Presentasi:</div>
													{session.materials.map((material) => {
														const { Icon, bg, color, label } = getFileIcon(material.name.split('.').pop() || 'file');
														return (
															<div
																key={material.id}
																className="d-flex align-items-center p-3 rounded"
																style={{
																	backgroundColor: '#f9fafb',
																	border: '1px solid #f3f4f6',
																	transition: 'background-color 0.2s',
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
																		{label} • {material.file_size || 'Unknown size'}
																	</p>
																</div>
																<div className="d-flex gap-2 flex-shrink-0 align-items-center">
																	<Button
																		variant="link"
																		className="text-secondary p-1 d-flex align-items-center justify-content-center"
																		onClick={() => setPreviewMaterial({
																			...material,
																			size: material.file_size || 'Unknown size'
																		})}
																		onMouseEnter={(e) => (e.currentTarget.style.color = '#1e293b')}
																		onMouseLeave={(e) => (e.currentTarget.style.color = '')}
																		title="Pratinjau"
																	>
																		<Eye size={18} />
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
																			<Download size={18} />
																		</Button>
																	)}
																</div>
															</div>
														);
													})}
												</div>
											)}
										</div>

										{/* Session card footer info */}
										<div
											className="px-4 py-2 border-top d-flex align-items-center justify-content-between flex-wrap gap-2 text-secondary"
											style={{
												backgroundColor: '#f8fafc',
												borderBottomLeftRadius: '12px',
												borderBottomRightRadius: '12px',
												borderColor: '#e2e8f0',
												fontSize: '12px',
											}}
										>
											<div className="d-flex align-items-center gap-1.5">
												<CheckCircle size={14} className="text-success" />
												<span>Materi ini eksklusif bagi peserta resmi yang telah terdaftar.</span>
											</div>
										</div>
									</div>
								</Collapse>
							)}
						</div>
					);
				})}
			</div>

			{/* Modals */}
			{previewMaterial && (
				<FilePreviewModal
					material={previewMaterial}
					onClose={() => setPreviewMaterial(null)}
				/>
			)}
			{videoPreviewUrl && (
				<VideoPreviewModal
					url={videoPreviewUrl}
					onClose={() => setVideoPreviewUrl(null)}
				/>
			)}
		</div>
	);
};

// Helper function to check if string is valid url
function filterVarUrl(string) {
	try {
		new URL(string);
		return true;
	} catch (_) {
		return false;
	}
}

export default ParticipantMaterialsTab;
