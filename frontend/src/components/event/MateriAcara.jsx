import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Form, Button, Table, Badge, Spinner, Modal, Row, Col, InputGroup, Collapse } from 'react-bootstrap';
import {
	Plus, Trash2, Edit2, Eye, EyeOff, FileText, Code, Palette,
	FileQuestion, Inbox, Upload, X, Search, Check,
	Link as LinkIcon, FolderOpen, BookOpen, Users, Download, ChevronDown
} from 'lucide-react';
import api from '../../api/axios';
import { notify } from '../../utils/notify';
import FormHeading from '../dashboard/FormHeading';
import StatCard from '../dashboard/StatCard';
import ConfirmationModal from '../dashboard/ConfirmationModal';
import { Skeleton, SkeletonStyles } from '../Skeleton';
import '../dashboard/StatCard.css';



const MateriAcara = ({ phase = 'before' }) => {
	const { eventId } = useParams();
	const { setIsPageLoading } = useOutletContext() || {};

	const [materials, setMaterials] = useState([]);
	const [eventSessions, setEventSessions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	// Modal state
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '' });

	const [formData, setFormData] = useState({
		title: '',
		session_name: '',
		speaker_name: '',
		type: 'document',
		description: '',
		status: 'published',
		content_url: '',
		phase: 'before',
	});

	const [selectedFiles, setSelectedFiles] = useState([]);
	const fileInputRef = useRef(null);
	const [showOptional, setShowOptional] = useState(false);

	// --- Data Fetching ---
	const fetchMaterialsAndSessions = async (silent = false) => {
		try {
			if (!silent) {
				setIsLoading(true);
				if (setIsPageLoading) setIsPageLoading(true);
			}
			const [matRes, sesRes] = await Promise.all([
				api.get(`/organizer/events/${eventId}/materials?phase=${phase}`),
				api.get(`event-dashboard/${eventId}/post-event/sessions`)
			]);
			if (matRes.data?.success) {
				setMaterials(matRes.data.data || []);
			}
			if (sesRes.data?.status === 'success') {
				setEventSessions(sesRes.data.data || []);
			}
		} catch (error) {
			console.error('Fetch error:', error);
			notify('error', 'Gagal', 'Gagal memuat data.');
		} finally {
			if (!silent) {
				setIsLoading(false);
				if (setIsPageLoading) setIsPageLoading(false);
			}
		}
	};

	useEffect(() => {
		if (eventId) {
			setMaterials([]);
			setEventSessions([]);
			fetchMaterialsAndSessions();
		}
	}, [eventId, phase]);

	// --- Form Handlers ---
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name === 'session_name') {
			const selectedSession = eventSessions.find(s => s.title === value);
			setFormData(prev => ({
				...prev,
				session_name: value,
				speaker_name: selectedSession ? selectedSession.speakers : ''
			}));
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
		}
	};

	const handleRefresh = () => {
		fetchMaterialsAndSessions();
	};

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		const MAX_SIZE = 50 * 1024 * 1024;
		const valid = files.filter(f => {
			if (f.size > MAX_SIZE) {
				notify('error', 'File Terlalu Besar', `${f.name} melebihi batas 50MB.`);
				return false;
			}
			return true;
		});
		setSelectedFiles(valid);
	};

	const resetForm = () => {
		setFormData({ title: '', session_name: '', speaker_name: '', type: 'document', description: '', status: 'published', content_url: '', phase: phase });
		setSelectedFiles([]);
		if (fileInputRef.current) fileInputRef.current.value = null;
	};

	const openAddModal = () => {
		setEditingId(null);
		resetForm();
		setShowOptional(false);
		setShowModal(true);
	};

	const openEditModal = (material) => {
		setEditingId(material.id);
		setFormData({
			title: material.title || '',
			session_name: material.session_name || '',
			speaker_name: material.speaker_name || '',
			type: material.type || 'document',
			description: material.description || '',
			status: material.status || 'published',
			content_url: material.content_url || '',
			phase: material.phase || 'before',
		});
		setSelectedFiles([]);
		setShowModal(true);
	};

	// --- CRUD ---
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.title.trim()) { notify('error', 'Validasi', 'Judul materi wajib diisi!'); return; }
		if (formData.type !== 'document' && !formData.content_url.trim()) {
			notify('error', 'Validasi', 'Tautan URL wajib diisi untuk tipe ini!'); return;
		}

		const fd = new FormData();
		fd.append('title', formData.title.trim());
		if (formData.session_name) fd.append('session_name', formData.session_name);
		if (formData.speaker_name) fd.append('speaker_name', formData.speaker_name);
		fd.append('type', formData.type);
		fd.append('description', formData.description.trim());
		fd.append('status', formData.status);
		fd.append('phase', formData.phase);

		if (formData.type === 'document') {
			if (selectedFiles.length > 0) {
				selectedFiles.forEach(f => fd.append('files[]', f));
			} else if (formData.content_url.trim()) {
				fd.append('content_url', formData.content_url.trim());
			}
		} else {
			fd.append('content_url', formData.content_url.trim());
		}

		setSubmitLoading(true);
		try {
			let res;
			if (editingId) {
				fd.append('_method', 'PUT');
				res = await api.post(`/organizer/events/${eventId}/materials/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			} else {
				res = await api.post(`/organizer/events/${eventId}/materials`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			}

			if (res.data?.success) {
				notify('success', 'Berhasil', editingId ? 'Materi berhasil diperbarui!' : 'Materi berhasil ditambahkan!');
				setShowModal(false);
				fetchMaterialsAndSessions(true);
			}
		} catch (error) {
			console.error('Submit materi error:', error);
			notify('error', 'Gagal', 'Gagal menyimpan materi.');
		} finally {
			setSubmitLoading(false);
		}
	};

	const handleDeleteConfirm = async () => {
		try {
			await api.delete(`/organizer/events/${eventId}/materials/${deleteModal.id}`);
			notify('success', 'Dihapus', 'Materi berhasil dihapus.');
			setDeleteModal({ show: false, id: null, title: '' });
			fetchMaterialsAndSessions(true);
		} catch (error) {
			notify('error', 'Gagal', 'Gagal menghapus materi.');
		}
	};

	const toggleStatus = async (material) => {
		const newStatus = material.status === 'published' ? 'draft' : 'published';
		try {
			const fd = new FormData();
			fd.append('title', material.title);
			fd.append('type', material.type);
			fd.append('status', newStatus);
			fd.append('_method', 'PUT');
			await api.post(`/organizer/events/${eventId}/materials/${material.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
			notify('success', 'Status Diubah', newStatus === 'published' ? 'Materi berhasil diterbitkan!' : 'Materi ditarik ke draft.');
			fetchMaterials(true);
		} catch (error) {
			notify('error', 'Gagal', 'Gagal mengubah status materi.');
		}
	};

	// --- Helpers ---
	const getTypeConfig = (t) => {
		switch (t) {
			case 'document': return { label: 'Dokumen', bg: '#dff3ff', color: '#00699e', Icon: FileText };
			case 'code_repo': return { label: 'Repo Kode', bg: '#1e293b', color: '#94a3b8', Icon: Code };
			case 'design_interactive': return { label: 'Desain', bg: '#fce7f3', color: '#9d174d', Icon: Palette };
			case 'media_form': return { label: 'Media Form', bg: '#ede9fe', color: '#5b21b6', Icon: LinkIcon };
			default: return { label: 'Tautan', bg: '#f1f5f9', color: '#64748b', Icon: FileQuestion };
		}
	};

	const existingSessions = [...new Set(materials.map(m => m.session_name).filter(Boolean))];
	const existingSpeakers = [...new Set(materials.map(m => m.speaker_name).filter(Boolean))];
	const publishedCount = materials.filter(m => m.status === 'published').length;
	const draftCount = materials.filter(m => m.status === 'draft').length;
	const totalTypes = [...new Set(materials.map(m => m.type))].length;

	const filteredMaterials = materials.filter(mat => {
		const q = searchQuery.toLowerCase();
		return (
			(mat.title || '').toLowerCase().includes(q) ||
			(mat.session_name || '').toLowerCase().includes(q) ||
			(mat.speaker_name || '').toLowerCase().includes(q)
		);
	});

	// --- Loading Skeleton ---
	if (isLoading) {
		return (
			<div>
				<SkeletonStyles />
				<FormHeading
					title="Manajemen Materi Acara"
					description="Kelola slide presentasi, dokumen, dan repositori untuk peserta."
					className="mb-4"
				/>
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
				<div className="d-flex flex-column gap-2">
					{[1, 2, 3].map(i => (
						<div key={i} className="p-3 bg-white d-flex align-items-center gap-3" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
							<Skeleton width="36px" height="36px" borderRadius="8px" />
							<div className="flex-grow-1">
								<Skeleton width="40%" height="14px" className="mb-2" />
								<Skeleton width="25%" height="11px" />
							</div>
							<Skeleton width="70px" height="24px" borderRadius="20px" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div>

			{/* Stat Cards */}
			{materials.length > 0 && (
				<div className="row g-3 mb-4">
					<div className="col-md-4 col-sm-6">
						<div className="stat-card-modern p-3 d-flex align-items-center gap-3" style={{ border: '1px solid #e2e8f0' }}>
							<div className="icon-wrapper d-flex align-items-center justify-content-center" style={{ backgroundColor: '#dff3ff', color: '#00699e' }}>
								<BookOpen size={20} />
							</div>
							<div>
								<p className="stat-value fw-bold text-dark mb-0">{materials.length}</p>
								<p className="stat-label text-uppercase text-muted mb-0">Total Materi</p>
							</div>
						</div>
					</div>
					<div className="col-md-4 col-sm-6">
						<div className="stat-card-modern p-3 d-flex align-items-center gap-3" style={{ border: '1px solid #e2e8f0' }}>
							<div className="icon-wrapper d-flex align-items-center justify-content-center" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
								<Eye size={20} />
							</div>
							<div>
								<p className="stat-value fw-bold text-dark mb-0">{publishedCount}</p>
								<p className="stat-label text-uppercase text-muted mb-0">Dipublikasikan</p>
							</div>
						</div>
					</div>
					<div className="col-md-4 col-sm-6">
						<div className="stat-card-modern p-3 d-flex align-items-center gap-3" style={{ border: '1px solid #e2e8f0' }}>
							<div className="icon-wrapper d-flex align-items-center justify-content-center" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
								<EyeOff size={20} />
							</div>
							<div>
								<p className="stat-value fw-bold text-dark mb-0">{draftCount}</p>
								<p className="stat-label text-uppercase text-muted mb-0">Draft</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Empty State */}
			{materials.length === 0 ? (
				<div
					className="d-flex flex-column align-items-center justify-content-center text-center py-5"
					style={{ border: '1px dashed #cbd5e1', borderRadius: '16px', backgroundColor: '#f8fafc', minHeight: '300px' }}
				>
					<div
						className="d-flex align-items-center justify-content-center mb-3"
						style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#dff3ff', color: '#00699e' }}
					>
						<FolderOpen size={28} />
					</div>
					<h6 className="fw-bold text-dark mb-1">Belum Ada Materi</h6>
					<p className="text-muted small mb-4" style={{ maxWidth: 320 }}>
						Tambahkan slide presentasi, dokumen, atau tautan referensi yang akan dibagikan kepada peserta.
					</p>
					<Button
						onClick={openAddModal}
						className="d-flex align-items-center gap-2 fw-semibold"
						style={{ backgroundColor: '#00699e', border: 'none', borderRadius: '10px', padding: '8px 20px', fontSize: '13px' }}
					>
						<Plus size={15} strokeWidth={2.5} />
						Mulai Tambah Materi
					</Button>
				</div>
			) : (
				/* Content Area */
				<div
					className="bg-white overflow-hidden"
					style={{ border: '1px solid #e2e8f0', borderRadius: '14px' }}
				>
					{/* Table Header / Search + Tambah */}
					<div className="px-4 pt-4 pb-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
						{/* Search bar */}
						<div
							className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 flex-grow-1"
							style={{ border: '1px solid #e2e8f0', maxWidth: 340 }}
						>
							<Search size={14} className="text-secondary flex-shrink-0" />
							<input
								type="text"
								className="border-0 bg-transparent w-100 shadow-none"
								placeholder="Cari judul, sesi, atau pembicara..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								style={{ outline: 'none', fontSize: '13px', color: '#1e293b' }}
							/>
							{searchQuery && (
								<button className="border-0 bg-transparent p-0 text-secondary" onClick={() => setSearchQuery('')}>
									<X size={13} />
								</button>
							)}
						</div>

						{/* Right side: count + button */}
						<div className="d-flex align-items-center gap-3 flex-shrink-0">
							<span className="fw-medium text-secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
								{filteredMaterials.length} dari {materials.length} materi
							</span>
							<Button
								onClick={openAddModal}
								className="d-flex align-items-center gap-2 fw-semibold flex-shrink-0"
								style={{
									backgroundColor: '#00699e',
									border: 'none',
									borderRadius: '9px',
									padding: '7px 16px',
									fontSize: '13px',
								}}
							>
								<Plus size={16} strokeWidth={2.5} />
								Tambah Materi
							</Button>
						</div>
					</div>

					{/* List Grouped by Session */}
					{filteredMaterials.length === 0 ? (
						<div className="text-center py-5 text-muted small">Tidak ada materi yang sesuai pencarian.</div>
					) : (
						<div className="d-flex flex-column gap-3 p-4 bg-light" style={{ borderRadius: '0 0 14px 14px' }}>
							{Object.entries(
								filteredMaterials.reduce((acc, mat) => {
									const s = mat.session_name || 'Materi Umum';
									if (!acc[s]) acc[s] = [];
									acc[s].push(mat);
									return acc;
								}, {})
							).map(([sessionName, mats], index) => {
								const publishedCount = mats.filter(m => m.status === 'published').length;
								const isAllPublished = publishedCount === mats.length && mats.length > 0;
								return (
									<div
										key={sessionName}
										className="bg-white overflow-hidden shadow-sm"
										style={{
											border: '1px solid #e2e8f0',
											borderLeft: '4px solid #cbd5e1',
											borderRadius: '14px',
										}}
									>
										<div
											className="px-4 py-3 d-flex align-items-center justify-content-between gap-3"
											style={{ backgroundColor: '#ffffff' }}
										>
											<div className="d-flex align-items-center gap-3 flex-grow-1 text-truncate">
												<div
													className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
													style={{
														width: 40, height: 40, borderRadius: 12,
														backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '15px'
													}}
												>
													{index + 1}
												</div>
												<div className="text-truncate">
													<p className="mb-0 fw-semibold text-dark" style={{ fontSize: '14px', letterSpacing: '-0.2px' }}>
														{sessionName}
													</p>
													<p className="mb-0 text-secondary text-truncate" style={{ fontSize: '12px' }}>
														{mats.length} Materi Tersedia
													</p>
												</div>
											</div>

											<div className="d-flex align-items-center gap-3 flex-shrink-0">
												<span
													className="d-inline-flex align-items-center gap-1 fw-semibold rounded-pill"
													style={{
														fontSize: '11.5px', padding: '4px 12px',
														backgroundColor: isAllPublished ? '#dcfce7' : '#f1f5f9',
														color: isAllPublished ? '#15803d' : '#64748b',
													}}
												>
													{isAllPublished ? <Eye size={11} /> : <EyeOff size={11} />}
													{publishedCount} / {mats.length} Published
												</span>
											</div>
										</div>

										<div className="p-0 border-top" style={{ borderColor: '#e2e8f0' }}>
											<div className="table-responsive">
												<table className="table align-middle mb-0" style={{ fontSize: '13px' }}>
													<thead style={{ backgroundColor: '#f8fafc' }}>
														<tr style={{ borderBottom: '1px solid #e2e8f0' }}>
															<th className="ps-4 py-2 fw-semibold text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Materi</th>
															<th className="py-2 fw-semibold text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pembicara</th>
															<th className="py-2 fw-semibold text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipe</th>
															<th className="py-2 fw-semibold text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
															<th className="pe-4 py-2 text-end fw-semibold text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aksi</th>
														</tr>
													</thead>
													<tbody>
														{mats.map((mat) => {
															const { label, bg, color, Icon: TypeIcon } = getTypeConfig(mat.type);
															return (
																<tr
																	key={mat.id}
																	style={{ borderTop: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
																	onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
																	onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
																>
																	<td className="ps-4 py-3" style={{ width: '35%' }}>
																		<p className="fw-semibold text-dark mb-1 text-truncate" style={{ maxWidth: 260 }}>{mat.title}</p>
																		<div className="d-flex align-items-center gap-2">
																			<span className="badge bg-light text-secondary border px-2 py-1 fw-medium" style={{ fontSize: '10px' }}>
																				{mat.phase === 'before' ? 'Sebelum Acara' : mat.phase === 'during' ? 'Saat Acara' : 'Setelah Acara'}
																			</span>
																			{mat.description && (
																				<span className="text-muted text-truncate" style={{ fontSize: '11.5px', maxWidth: 150 }}>
																					{mat.description}
																				</span>
																			)}
																		</div>
																	</td>
																	<td className="py-3" style={{ width: '20%' }}>
																		{mat.speaker_name ? (
																			<span className="d-inline-flex align-items-center gap-1 text-secondary" style={{ fontSize: '12px' }}>
																				🎤 {mat.speaker_name}
																			</span>
																		) : (
																			<span className="text-muted" style={{ fontSize: '12px' }}>—</span>
																		)}
																	</td>
																	<td className="py-3" style={{ width: '15%' }}>
																		<span
																			className="d-inline-flex align-items-center gap-1 fw-semibold rounded-pill px-2"
																			style={{ backgroundColor: bg, color, fontSize: '11.5px', padding: '4px 10px' }}
																		>
																			<TypeIcon size={12} />
																			{label}
																		</span>
																	</td>
																	<td className="py-3" style={{ width: '15%' }}>
																		<span
																			className="d-inline-flex align-items-center gap-1 fw-semibold rounded-pill"
																			style={{
																				fontSize: '11px',
																				padding: '4px 10px',
																				backgroundColor: mat.status === 'published' ? '#dcfce7' : '#f1f5f9',
																				color: mat.status === 'published' ? '#15803d' : '#64748b',
																			}}
																		>
																			{mat.status === 'published' ? <Eye size={10} /> : <EyeOff size={10} />}
																			{mat.status === 'published' ? 'Published' : 'Draft'}
																		</span>
																	</td>
																	<td className="pe-4 py-3 text-end" style={{ width: '15%' }}>
																		<div className="d-inline-flex gap-2 align-items-center justify-content-end w-100">
																			<button
																				className="btn d-flex align-items-center justify-content-center"
																				style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#64748b', transition: 'all 0.15s', padding: 0 }}
																				title={mat.status === 'published' ? 'Tarik ke Draft' : 'Terbitkan'}
																				onClick={() => toggleStatus(mat)}
																				onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
																				onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
																			>
																				{mat.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
																			</button>
																			<button
																				className="btn d-flex align-items-center justify-content-center"
																				style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#64748b', transition: 'all 0.15s', padding: 0 }}
																				title="Edit"
																				onClick={() => openEditModal(mat)}
																				onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dff3ff'; e.currentTarget.style.color = '#00699e'; e.currentTarget.style.borderColor = '#bae6fd'; }}
																				onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
																			>
																				<Edit2 size={15} />
																			</button>
																			<button
																				className="btn d-flex align-items-center justify-content-center"
																				style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#64748b', transition: 'all 0.15s', padding: 0 }}
																				title="Hapus"
																				onClick={() => setDeleteModal({ show: true, id: mat.id, title: mat.title })}
																				onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#b91c1c'; e.currentTarget.style.borderColor = '#fca5a5'; }}
																				onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
																			>
																				<Trash2 size={15} />
																			</button>
																		</div>
																	</td>
																</tr>
															);
														})}
													</tbody>
												</table>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* ===== FORM MODAL ===== */}
			<Modal
				show={showModal}
				onHide={() => !submitLoading && setShowModal(false)}
				centered
				size="lg"
				contentClassName="border-0 shadow-lg overflow-hidden"
				style={{ borderRadius: '16px' }}
			>
				<Modal.Header
					closeButton={!submitLoading}
					className="border-0 px-4 pt-4 pb-3"
					style={{ backgroundColor: '#f8fafc' }}
				>
					<div>
						<h5 className="fw-bold text-dark mb-0" style={{ fontSize: '16px', letterSpacing: '-0.3px' }}>
							{editingId ? 'Edit Materi' : 'Tambah Materi Baru'}
						</h5>
						<p className="text-secondary mb-0 mt-1" style={{ fontSize: '12.5px' }}>
							{editingId ? 'Perbarui informasi materi yang sudah ada.' : 'Isi formulir berikut untuk menambahkan materi baru.'}
						</p>
					</div>
				</Modal.Header>
				<Modal.Body className="p-0">
					<Form onSubmit={handleSubmit}>
						{/* --- SECTION 1: Informasi Dasar --- */}
						<div className="p-4 pb-4">
							<h6 className="fw-bold text-dark mb-3" style={{ fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
								1. Informasi Utama
							</h6>
							<Row className="g-3">
								<Col md={12}>
									<Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12.5px' }}>Judul Materi <span className="text-danger">*</span></Form.Label>
									<Form.Control
										required
										type="text"
										name="title"
										value={formData.title}
										onChange={handleInputChange}
										placeholder="Misal: Slide Pemrograman Lanjut Hari ke-1"
										className="shadow-none bg-light"
										style={{ borderRadius: '8px', fontSize: '13px', border: '1px solid #e2e8f0', padding: '10px 14px' }}
									/>
								</Col>
								<Col md={6}>
									<Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12.5px' }}>Tipe Materi <span className="text-danger">*</span></Form.Label>
									<Form.Select 
										name="type" 
										value={formData.type} 
										onChange={e => { handleInputChange(e); setSelectedFiles([]); if (fileInputRef.current) fileInputRef.current.value = null; }} 
										className="shadow-none bg-light"
										style={{ borderRadius: '8px', fontSize: '13px', border: '1px solid #e2e8f0', padding: '10px 14px' }}
									>
										<option value="document">📄 Dokumen / PDF / Slide</option>
										<option value="code_repo">💻 Repository GitHub</option>
										<option value="design_interactive">🎨 Desain Figma / Prototype</option>
										<option value="media_form">🔗 Media / Google Form</option>
									</Form.Select>
								</Col>
								<Col md={6}>
									<Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12.5px' }}>Fase Publikasi <span className="text-danger">*</span></Form.Label>
									<Form.Select 
										name="phase" 
										value={formData.phase} 
										onChange={handleInputChange} 
										className="shadow-none bg-light"
										style={{ borderRadius: '8px', fontSize: '13px', border: '1px solid #e2e8f0', padding: '10px 14px' }}
									>
										<option value="before">Sebelum Acara</option>
										<option value="during">Saat Acara</option>
										<option value="after">Setelah Acara</option>
									</Form.Select>
								</Col>
							</Row>
						</div>

						{/* --- SECTION 2: Konten / File --- */}
						<div className="p-4 border-top" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
							<h6 className="fw-bold text-dark mb-3" style={{ fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
								2. Berkas / Tautan Materi
							</h6>
							{formData.type === 'document' ? (
								<div>
									{selectedFiles.length === 0 ? (
										<label
											className="d-flex flex-column align-items-center justify-content-center w-100 rounded text-center bg-white"
											style={{ border: '1.5px dashed #cbd5e1', cursor: 'pointer', transition: 'all 0.2s', padding: '2rem 1rem' }}
											onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
											onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
										>
											<div className="mb-2 p-2 rounded-circle" style={{ backgroundColor: '#e0f2fe' }}>
												<Upload size={20} color="#0284c7" />
											</div>
											<span className="fw-semibold text-dark mb-1" style={{ fontSize: '13.5px' }}>Klik atau seret dokumen ke sini</span>
											<span className="text-secondary" style={{ fontSize: '11.5px' }}>Format: PDF, PPTX, DOCX (Maks 50MB)</span>
											<input
												type="file"
												multiple
												ref={fileInputRef}
												onChange={handleFileChange}
												accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
												className="d-none"
											/>
										</label>
									) : (
										<div className="d-flex align-items-center justify-content-between p-3 rounded bg-white shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
											<div className="d-flex align-items-center gap-3">
												<div className="p-2 rounded bg-light">
													<FileText size={18} color="#0284c7" />
												</div>
												<div>
													<span className="fw-semibold text-dark d-block" style={{ fontSize: '13px' }}>
														{selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} berkas siap diunggah`}
													</span>
													<span className="text-secondary d-block" style={{ fontSize: '11.5px' }}>Tinjau sebelum menyimpan</span>
												</div>
											</div>
											<button className="btn btn-sm text-danger d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: '#fee2e2', borderRadius: '8px' }} onClick={(e) => { e.preventDefault(); setSelectedFiles([]); if (fileInputRef.current) fileInputRef.current.value = null; }}>
												<X size={16} />
											</button>
										</div>
									)}
								</div>
							) : (
								<div>
									<InputGroup className="shadow-none">
										<InputGroup.Text className="bg-white text-secondary border-end-0" style={{ border: '1px solid #e2e8f0', borderRadius: '8px 0 0 8px' }}>
											<LinkIcon size={16} />
										</InputGroup.Text>
										<Form.Control
											type="url"
											name="content_url"
											value={formData.content_url}
											onChange={handleInputChange}
											placeholder="https://..."
											className="shadow-none border-start-0 bg-white"
											style={{ borderRadius: '0 8px 8px 0', fontSize: '13px', border: '1px solid #e2e8f0', padding: '10px 14px' }}
										/>
									</InputGroup>
								</div>
							)}
						</div>

						{/* --- SECTION 3: Pengaturan Opsional --- */}
						<div className="border-top" style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
							<div
								className="p-4 d-flex align-items-center justify-content-between cursor-pointer"
								onClick={() => setShowOptional(!showOptional)}
								style={{ transition: 'background-color 0.2s' }}
								onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
								onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
							>
								<div className="d-flex align-items-center gap-2">
									<h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
										3. Pengaturan Tambahan (Opsional)
									</h6>
									{!showOptional && (
										<span className="badge bg-light text-secondary border" style={{ fontSize: '10px' }}>Sesi, Pembicara, Deskripsi</span>
									)}
								</div>
								<div style={{ transition: 'transform 0.3s ease', transform: showOptional ? 'rotate(180deg)' : 'rotate(0)' }}>
									<ChevronDown size={18} className="text-secondary" />
								</div>
							</div>

							<Collapse in={showOptional}>
								<div className="px-4 pb-4">
									<Row className="g-3">
										<Col md={12}>
											<Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12.5px' }}>Pilih Sesi Terkait</Form.Label>
											<Form.Select
												name="session_name"
												value={formData.session_name}
												onChange={handleInputChange}
												className="shadow-none bg-light"
												style={{ borderRadius: '8px', fontSize: '13px', border: '1px solid #e2e8f0', padding: '10px 14px' }}
											>
												<option value="">-- Materi Umum (Tidak Terikat Sesi) --</option>
												{eventSessions.map(session => (
													<option key={session.id} value={session.title}>
														{session.date} | {session.start_time} - {session.title}
													</option>
												))}
											</Form.Select>
										</Col>
										<Col md={12}>
											<Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12.5px' }}>Deskripsi Singkat</Form.Label>
											<Form.Control
												as="textarea"
												rows={2}
												name="description"
												value={formData.description}
												onChange={handleInputChange}
												placeholder="Tambahkan instruksi atau penjelasan singkat untuk peserta..."
												className="shadow-none bg-light"
												style={{ borderRadius: '8px', fontSize: '13px', border: '1px solid #e2e8f0', padding: '10px 14px', resize: 'none' }}
											/>
										</Col>
										<Col md={12}>
											<Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12.5px' }}>Visibilitas Awal</Form.Label>
											<div className="d-flex gap-3 mt-1">
												<Form.Check
													type="radio"
													id="status-published"
													name="status"
													value="published"
													checked={formData.status === 'published'}
													onChange={handleInputChange}
													label={
														<span className="ms-1" style={{ fontSize: '13px', fontWeight: formData.status === 'published' ? 600 : 400 }}>
															Langsung Terbit <Eye size={14} className="ms-1 text-success" />
														</span>
													}
												/>
												<Form.Check
													type="radio"
													id="status-draft"
													name="status"
													value="draft"
													checked={formData.status === 'draft'}
													onChange={handleInputChange}
													label={
														<span className="ms-1 text-secondary" style={{ fontSize: '13px', fontWeight: formData.status === 'draft' ? 600 : 400 }}>
															Simpan Draft <EyeOff size={14} className="ms-1" />
														</span>
													}
												/>
											</div>
										</Col>
									</Row>
								</div>
							</Collapse>
						</div>

						<Modal.Footer className="border-top px-4 py-3" style={{ backgroundColor: '#f8fafc' }}>
							<Button variant="light" onClick={() => setShowModal(false)} className="fw-semibold border" style={{ borderRadius: '8px', fontSize: '13.5px', padding: '8px 20px' }}>
								Batal
							</Button>
							<Button
								type="submit"
								disabled={submitLoading}
								className="fw-semibold d-flex align-items-center gap-2"
								style={{ backgroundColor: '#00699e', border: 'none', borderRadius: '8px', fontSize: '13.5px', padding: '8px 24px' }}
							>
								{submitLoading ? <Spinner size="sm" /> : <Check size={16} />}
								{submitLoading ? 'Menyimpan...' : 'Simpan Materi'}
							</Button>
						</Modal.Footer>
					</Form>
				</Modal.Body>
			</Modal>

			{/* ===== HAPUS CONFIRMATION ===== */}
			<ConfirmationModal
				show={deleteModal.show}
				onHide={() => setDeleteModal({ show: false, id: null, title: '' })}
				onConfirm={handleDeleteConfirm}
				config={{
					title: 'Hapus Materi',
					desc: `Yakin ingin menghapus "${deleteModal.title}"? Tindakan ini tidak dapat dibatalkan.`,
					icon: Trash2,
					iconColor: '#b91c1c',
					iconBg: '#fee2e2',
					iconBorder: '#fca5a5',
					btnVariant: 'danger',
				}}
			/>
		</div>
	);
};

export default MateriAcara;
