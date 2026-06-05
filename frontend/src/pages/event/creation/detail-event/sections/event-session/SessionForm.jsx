import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import {
	X,
	Trash2,
	AlignLeft,
	Calendar,
	Clock,
	Link as LinkIcon,
	Users,
	Plus,
	Mic,
	Eye,
	EyeOff,
	MicOff,
} from 'lucide-react';

import SpeakerList, { getSpeakerAvatar } from './SpeakerList';
import SpeakerForm from './SpeakerForm';
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';

const SessionForm = ({
	data,
	days = [],
	onClose,
	onSaveSession,
	onDeleteSession,
	onToggleHideSession,
	allSpeakers = [],
	onEditSpeaker,
	onDeleteSpeaker,
	onSaveSpeaker,
	isModal = false,
	onSizeChange,
}) => {
	// --- STATE ---
	const [sessionData, setSessionData] = useState({
		title: '',
		description: '',
		startTime: '',
		endTime: '',
		dayNumber: 1,
		prerequisite_session_ids: [],
		speakers: [],
		no_speaker: false,
	});
	const [activeView, setActiveView] = useState('form');
	const [prevView, setPrevView] = useState('form');
	const [selectedSpeakerToEdit, setSelectedSpeakerToEdit] = useState(null);
	const [touched, setTouched] = useState({});
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// --- EFFECT HOOKS ---
	useEffect(() => {
		if (onSizeChange) {
			onSizeChange(activeView === 'speaker-add' ? 'md' : 'lg');
		}
	}, [activeView, onSizeChange]);

	useEffect(() => {
		if (data) {
			setSessionData({
				title: data.title || '',
				description: data.description || '',
				startTime: data.startTime || '',
				endTime: data.endTime || '',
				dayNumber: data.dayNumber || 1,
				prerequisite_session_ids: data.prerequisite_session_ids || [],
				speakers: data.speakers || [],
				no_speaker: data.no_speaker || false,
			});
		}
	}, [data]);

	// --- HANDLERS ---
	const handleBlur = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
	const handleChange = (e) =>
		setSessionData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	const handlePrerequisiteChange = (e) =>
		setSessionData((prev) => ({
			...prev,
			prerequisite_session_ids: e.target.value ? [e.target.value] : [],
		}));

	const handleSubmit = () => {
		setTouched({ title: true, startTime: true, endTime: true, speakers: true });

		const hasSpeakers = sessionData.speakers?.length > 0;
		if (
			!sessionData.title.trim() ||
			!sessionData.startTime ||
			!sessionData.endTime ||
			(!hasSpeakers && !sessionData.no_speaker)
		) {
			// Asumsi notify() tersedia secara global atau di-import
			// notify('error', 'Gagal', 'Mohon lengkapi seluruh kolom wajib yang ditandai.');
			return;
		}
		if (onSaveSession) onSaveSession({ ...data, ...sessionData });
	};

	const handleAddSpeakerLocal = (speaker) => {
		setSessionData((prev) => {
			if (prev.speakers?.some((s) => s.id === speaker.id)) return prev;
			return { ...prev, speakers: [...(prev.speakers || []), speaker] };
		});
	};

	const hasChanges = () => {
		if (!data) return false;
		return (
			sessionData.title !== (data.title || '') ||
			sessionData.description !== (data.description || '') ||
			sessionData.startTime !== (data.startTime || '') ||
			sessionData.endTime !== (data.endTime || '') ||
			parseInt(sessionData.dayNumber) !== parseInt(data.dayNumber || 1) ||
			JSON.stringify(sessionData.prerequisite_session_ids) !==
				JSON.stringify(data.prerequisite_session_ids || []) ||
			JSON.stringify(sessionData.speakers) !== JSON.stringify(data.speakers || []) ||
			sessionData.no_speaker !== (data.no_speaker || false)
		);
	};

	// --- LOGIC & VALIDATION ---
	const allOtherSessions = days.flatMap((day) =>
		(day.sessions || [])
			.filter((s) => s.id !== data?.id)
			.map((s) => ({
				...s,
				dayNumber: day.day_number || day.dayNumber || days.indexOf(day) + 1,
			})),
	);

	let prerequisiteWarning = null;
	if (sessionData.prerequisite_session_ids?.length > 0) {
		const prereqSession = allOtherSessions.find(
			(s) => s.id == sessionData.prerequisite_session_ids[0],
		);
		if (prereqSession && sessionData.startTime && prereqSession.endTime) {
			const currentDay = parseInt(sessionData.dayNumber);
			const prereqDay = parseInt(prereqSession.dayNumber);

			if (currentDay < prereqDay) {
				prerequisiteWarning =
					'Jadwal sesi ini berada pada hari sebelum sesi prasyarat selesai.';
			} else if (currentDay === prereqDay && sessionData.startTime < prereqSession.endTime) {
				prerequisiteWarning =
					'Jadwal sesi ini berada sebelum sesi prasyarat selesai, harap periksa kembali waktu pelaksanaan.';
			}
		}
	}

	// --- STYLES ---
	const flatInputStyle = {
		borderRadius: '8px',
		border: '1.5px solid #cbd5e1',
		fontSize: '14px',
		backgroundColor: '#f8fafc',
		boxShadow: 'none',
	};

	// --- RENDERERS ---
	return (
		<div
			style={{ width: isModal ? '100%' : '500px', height: '100%', overflow: 'auto' }}
			className={isModal ? 'bg-white border-0' : 'bg-white border rounded-2'}
		>
			{activeView === 'form' && (
				<>
					{/* Header */}
					<div className="px-4 my-3 d-flex justify-content-between align-items-center">
						<div className="d-flex align-items-center">
							<div
								className="rounded-circle me-2"
								style={{
									width: '8px',
									height: '8px',
									backgroundColor: 'var(--color-primary)',
								}}
							/>
							<span className="fs-5 fw-bold">EDIT SESI</span>
						</div>
						<div className="d-flex gap-2">
							{data && (
								<Button
									variant="light"
									className="rounded-circle p-2 d-flex border-0"
									style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
									onClick={onToggleHideSession}
									title={data.isHidden ? 'Tampilkan Sesi' : 'Sembunyikan Sesi'}
								>
									{data.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
								</Button>
							)}
							<Button
								variant="light"
								className="rounded-circle p-2 d-flex border-0"
								style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}
								onClick={() => setShowDeleteModal(true)}
							>
								<Trash2 size={18} />
							</Button>
							<Button
								variant="light"
								className="rounded-circle p-2 d-flex border-0"
								style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
								onClick={onClose}
							>
								<X size={18} />
							</Button>
						</div>
					</div>

					{/* Form Body */}
					<div className="flex-grow-1 overflow-auto px-4">
						<Form.Group className="mb-3">
							<Form.Label className="form-label required">
								<AlignLeft size={14} className="me-1" /> Judul Sesi
							</Form.Label>
							<Form.Control
								type="text"
								name="title"
								value={sessionData.title}
								onChange={(e) => {
									// 1. Regex untuk mengubah huruf pertama di setiap kata menjadi kapital
									e.target.value = e.target.value.replace(/\b\w/g, (char) =>
										char.toUpperCase(),
									);
									// 2. Jalankan fungsi handleChange bawaan kamu
									handleChange(e);
								}}
								onBlur={() => handleBlur('title')}
								// 3. Gunakan 'capitalize' untuk menyelaraskan visual di layar
								style={{ ...flatInputStyle, textTransform: 'capitalize' }}
								isInvalid={touched.title && !sessionData.title?.trim()}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<Form.Label className="form-label mb-0">
									<AlignLeft size={14} className="me-1" /> Deskripsi
								</Form.Label>
								<span className="text-muted" style={{ fontSize: '13px' }}>
									Opsional
								</span>
							</div>
							<Form.Control
								as="textarea"
								rows={4}
								maxLength={500}
								name="description"
								value={sessionData.description}
								onChange={handleChange}
								style={{ ...flatInputStyle, resize: 'none' }}
							/>
						</Form.Group>

						<Row>
							<Col xs={12} className="mb-3">
								<Form.Label className="form-label required">
									<Calendar size={14} className="me-1" /> Hari
								</Form.Label>
								<Form.Select
									name="dayNumber"
									value={sessionData.dayNumber}
									onChange={handleChange}
									style={flatInputStyle}
								>
									{days.map((day, idx) => {
										const dNum = day.day_number || idx + 1;
										return (
											<option key={dNum} value={dNum}>
												Hari {dNum}
											</option>
										);
									})}
								</Form.Select>
							</Col>
							<Col xs={12} className="mb-3">
								<Form.Label className="form-label required">
									<Clock size={14} className="me-1" /> Waktu
								</Form.Label>
								<div className="d-flex align-items-center gap-2">
									<Form.Control
										type="time"
										name="startTime"
										value={sessionData.startTime}
										onChange={handleChange}
										onBlur={() => handleBlur('startTime')}
										style={flatInputStyle}
										isInvalid={touched.startTime && !sessionData.startTime}
									/>
									<span>-</span>
									<Form.Control
										type="time"
										name="endTime"
										value={sessionData.endTime}
										onChange={handleChange}
										onBlur={() => handleBlur('endTime')}
										style={flatInputStyle}
										isInvalid={touched.endTime && !sessionData.endTime}
									/>
								</div>
							</Col>
						</Row>

						{/* <Form.Group className="mb-3">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<Form.Label className="form-label mb-0">
									<LinkIcon size={14} className="me-1" /> Prasyarat Sesi
								</Form.Label>
								<span className="text-muted" style={{ fontSize: '13px' }}>
									Opsional
								</span>
							</div>
							<Form.Select
								value={sessionData.prerequisite_session_ids?.[0] || ''}
								onChange={handlePrerequisiteChange}
								style={flatInputStyle}
							>
								<option value="">Tidak ada prasyarat</option>
								{allOtherSessions.map((s) => (
									<option key={s.id} value={s.id}>
										{s.title || 'Sesi Tanpa Judul'}
									</option>
								))}
							</Form.Select>
							{prerequisiteWarning && (
								<div
									className="mt-2 p-2 rounded"
									style={{
										backgroundColor: '#fff3cd',
										color: '#856404',
										fontSize: '13px',
									}}
								>
									⚠️ {prerequisiteWarning}
								</div>
							)}
						</Form.Group> */}

						{/* Pembicara Section */}
						<div className="mb-4">
							<div className="d-flex justify-content-between align-items-center mb-3">
								<Form.Label className="form-label required mb-0">
									<Users size={14} className="me-1" /> Pembicara
								</Form.Label>
								{!sessionData.no_speaker && (
									<Button
										variant="link"
										className="text-decoration-none p-0 d-flex align-items-center gap-1 fw-bold"
										onClick={() => {
											setPrevView('form');
											setActiveView('speaker-list');
										}}
									>
										<Plus size={16} /> Tambah
									</Button>
								)}
							</div>

							{/* Redesigned Switch: Flat, Distinct Border, Highly Visible */}
							<label
								className="d-flex align-items-center justify-content-between p-3 mb-3 w-100"
								style={{
									backgroundColor: sessionData.no_speaker ? '#eff6ff' : '#f8fafc',
									border: sessionData.no_speaker
										? '1.5px solid #3b82f6'
										: '1.5px solid #cbd5e1',
									borderRadius: '8px',
									cursor: 'pointer',
									transition: 'all 0.2s ease',
								}}
							>
								<div className="d-flex align-items-center gap-3">
									<div
										className="d-flex justify-content-center align-items-center rounded"
										style={{
											width: '40px',
											height: '40px',
											backgroundColor: sessionData.no_speaker
												? '#bfdbfe'
												: '#e2e8f0',
										}}
									>
										{sessionData.no_speaker ? (
											<MicOff size={20} color="#1d4ed8" />
										) : (
											<Mic size={20} color="#64748b" />
										)}
									</div>
									<div>
										<h6
											className="m-0 fw-bold"
											style={{
												color: sessionData.no_speaker
													? '#1e3a8a'
													: '#334155',
											}}
										>
											Tanpa Pembicara
										</h6>
										<span style={{ fontSize: '12px', color: '#64748b' }}>
											Aktifkan untuk sesi Break, Penutup, dsb.
										</span>
									</div>
								</div>
								<Form.Check
									type="switch"
									id="no-speaker-switch"
									checked={sessionData.no_speaker || false}
									onChange={(e) => {
										const val = e.target.checked;
										setSessionData((prev) => ({
											...prev,
											no_speaker: val,
											speakers: val ? [] : prev.speakers,
										}));
										setTouched((prev) => ({ ...prev, speakers: true }));
									}}
									style={{ transform: 'scale(1.2)', margin: 0 }}
								/>
							</label>

							{!sessionData.no_speaker &&
								touched.speakers &&
								!sessionData.speakers?.length && (
									<div className="text-danger small mt-1 mb-3">
										Mohon tambahkan pembicara atau aktifkan opsi di atas.
									</div>
								)}

							{/* Speaker Cards */}
							{!sessionData.no_speaker &&
								sessionData.speakers?.map((speaker) => (
									<div
										key={speaker.id}
										className="border bg-white p-3 mt-2 position-relative"
										style={{
											borderRadius: '12px',
											borderColor: '#cbd5e1',
											cursor: 'pointer',
										}}
										onClick={() => {
											setSelectedSpeakerToEdit(speaker);
											setPrevView('form');
											setActiveView('speaker-add');
										}}
									>
										<Button
											variant="outline-danger"
											size="sm"
											className="position-absolute py-1 px-2"
											style={{
												top: '12px',
												right: '12px',
												borderRadius: '8px',
												zIndex: 5,
											}}
											onClick={(e) => {
												e.stopPropagation();
												setSessionData((prev) => ({
													...prev,
													speakers: prev.speakers.filter(
														(s) => s.id !== speaker.id,
													),
												}));
											}}
										>
											Hapus
										</Button>
										<div className="d-flex align-items-center gap-3">
											{getSpeakerAvatar(speaker) && (
												<img
													src={getSpeakerAvatar(speaker)}
													alt={speaker.name}
													className="rounded-circle"
													style={{
														width: '48px',
														height: '48px',
														objectFit: 'cover',
													}}
												/>
											)}
											<div>
												<h6 className="m-0 fw-bold text-dark">
													{speaker.name}
												</h6>
												<p
													className="m-0 text-muted"
													style={{ fontSize: '13px', lineHeight: 1.4 }}
												>
													{speaker.role || speaker.title}
													<br />
													{speaker.bio || speaker.company}
												</p>
											</div>
										</div>
									</div>
								))}
						</div>
					</div>

					{/* Footer */}
					<div className="p-3 border-top bg-white d-flex gap-2">
						<Button
							variant="outline-secondary"
							onClick={onClose}
							style={{ borderRadius: '8px', flex: 1, fontWeight: 500 }}
						>
							Batal
						</Button>
						<Button
							disabled={!hasChanges()}
							onClick={handleSubmit}
							className="border-0"
							style={{
								backgroundColor: hasChanges() ? 'var(--color-primary)' : '#f1f5f9',
								color: hasChanges() ? '#fff' : '#64748b',
								borderRadius: '8px',
								flex: 1,
								fontWeight: 500,
							}}
						>
							{hasChanges() ? 'Simpan Perubahan' : 'Tidak Ada Perubahan'}
						</Button>
					</div>
				</>
			)}

			{/* Other Views (List & Add Speaker) */}
			{activeView === 'speaker-list' && (
				<SpeakerList
					sessionSpeakers={sessionData.speakers || []}
					onAddSpeaker={handleAddSpeakerLocal}
					onChangeSidebar={(action) => {
						if (action === 'speaker-add') {
							setSelectedSpeakerToEdit(null);
							setPrevView('speaker-list');
							setActiveView('speaker-add');
						} else setActiveView('form');
					}}
					allSpeakers={allSpeakers}
					onEditSpeaker={(speaker) => {
						setSelectedSpeakerToEdit(speaker);
						setPrevView('speaker-list');
						setActiveView('speaker-add');
					}}
					onDeleteSpeaker={onDeleteSpeaker}
					isModal={true}
				/>
			)}

			{activeView === 'speaker-add' && (
				<SpeakerForm
					onChangeSidebar={() => setActiveView(prevView)}
					initialData={selectedSpeakerToEdit}
					onSave={async (speakerData) => {
						if (onSaveSpeaker) {
							const savedSpeaker = await onSaveSpeaker(speakerData);
							if (savedSpeaker) {
								setSessionData((prev) => {
									const exists = prev.speakers.some(
										(s) => s.id === savedSpeaker.id,
									);
									return {
										...prev,
										speakers: exists
											? prev.speakers.map((s) =>
													s.id === savedSpeaker.id ? savedSpeaker : s,
												)
											: [...prev.speakers, savedSpeaker],
									};
								});
							}
						}
						setActiveView(prevView);
					}}
					isModal={true}
				/>
			)}

			<ConfirmationModal
				show={showDeleteModal}
				onHide={() => setShowDeleteModal(false)}
				onConfirm={() => {
					setShowDeleteModal(false);
					if (onDeleteSession) onDeleteSession();
				}}
				config={{
					title: 'Hapus Sesi',
					desc: 'Apakah Anda yakin ingin menghapus sesi ini? Tindakan ini tidak dapat dibatalkan.',
					icon: Trash2,
					iconColor: '#ef4444',
					iconBg: '#fee2e2',
					iconBorder: '#fecaca',
					btnVariant: 'danger',
				}}
			/>
		</div>
	);
};

export default SessionForm;
