import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Form, Row, Col, Button } from 'react-bootstrap';
import {
	X,
	Trash2,
	Sparkles,
	AlignLeft,
	Calendar,
	Clock,
	Link as LinkIcon,
	Users,
	Plus,
	Mic,
	HelpCircle,
	Eye,
	EyeOff,
} from 'lucide-react';
import SpeakerList, { getSpeakerAvatar } from './SpeakerList';
import SpeakerForm from './SpeakerForm';

const SessionForm = ({
	data,
	days = [],
	onClose,
	onSaveSession,
	onDeleteSession,
	onToggleHideSession,
	onChangeSidebar,
	allSpeakers = [],
	onEditSpeaker,
	onDeleteSpeaker,
	onSaveSpeaker,
	isModal = false,
	onSizeChange,
}) => {
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
	const [activeView, setActiveView] = useState('form'); // 'form', 'speaker-list', 'speaker-add'
	const [prevView, setPrevView] = useState('form');
	const [selectedSpeakerToEdit, setSelectedSpeakerToEdit] = useState(null);
	const [activeType, setActiveType] = useState('Keynote');
	const sessionTypes = ['Keynote', 'Panel', 'Workshop', 'Sesi', 'Break'];

	// Ubah ukuran modal berdasarkan view aktif
	useEffect(() => {
		if (onSizeChange) {
			if (activeView === 'speaker-add') {
				onSizeChange('md');
			} else {
				onSizeChange('lg');
			}
		}
	}, [activeView, onSizeChange]);

	// Ketika props 'data' berubah (user klik sesi lain), update form
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

	const handleChange = (e) => {
		const { name, value } = e.target;
		setSessionData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePrerequisiteChange = (e) => {
		const value = e.target.value;
		setSessionData((prev) => ({
			...prev,
			prerequisite_session_ids: value ? [value] : [],
		}));
	};

	const handleSubmit = () => {
		// Gabungkan data lama (id dll) dengan editan baru
		const updatedSession = { ...data, ...sessionData };
		if (onSaveSession) onSaveSession(updatedSession);
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

	const handleAddSpeakerLocal = (speaker) => {
		setSessionData((prev) => {
			const currentSpeakers = prev.speakers || [];
			if (currentSpeakers.some((s) => s.id === speaker.id)) {
				return prev;
			}
			return {
				...prev,
				speakers: [...currentSpeakers, speaker],
			};
		});
	};

	// Cari tahu daftar sesi lain untuk prerequisite
	const allOtherSessions = [];
	days.forEach((day) => {
		if (day.sessions) {
			day.sessions.forEach((s) => {
				if (s.id !== data?.id) {
					allOtherSessions.push({
						...s,
						dayNumber: day.day_number || day.dayNumber || days.indexOf(day) + 1,
					});
				}
			});
		}
	});

	// Validasi prerequisite
	let prerequisiteWarning = null;
	if (sessionData.prerequisite_session_ids && sessionData.prerequisite_session_ids.length > 0) {
		const prereqId = sessionData.prerequisite_session_ids[0];
		const prereqSession = allOtherSessions.find((s) => s.id == prereqId); // string/int comparison

		if (prereqSession && sessionData.startTime && prereqSession.endTime) {
			const currentDay = parseInt(sessionData.dayNumber);
			const prereqDay = parseInt(prereqSession.dayNumber);

			if (currentDay < prereqDay) {
				prerequisiteWarning =
					'Jadwal sesi ini berada pada hari sebelum sesi prasyarat selesai.';
			} else if (currentDay === prereqDay) {
				if (sessionData.startTime < prereqSession.endTime) {
					prerequisiteWarning =
						'Jadwal sesi ini berada sebelum sesi prasyarat selesai, harap periksa kembali waktu pelaksanaan.';
				}
			}
		}
	}

	// Reusable inline style untuk flat input agar tidak berulang
	const flatInputStyle = {
		borderRadius: '8px',
		border: '1.5px solid #cbd5e1',
		fontSize: '14px',
		backgroundColor: '#f8fafc',
		boxShadow: 'none',
	};

	const labelStyle = {
		// fontSize: '0.75rem',
		// fontWeight: 600,/
		// color: '#64748b',
		// letterSpacing: '0.5px',
	};

	return (
		<div
			style={{ width: isModal ? '100%' : '500px', height: '100%', overflow: 'auto' }}
			className={isModal ? 'bg-white border-0' : 'bg-white border rounded-2'}
		>
			{activeView === 'form' && (
				<>
					{/* Title Section */}
					<div className="px-4 my-3 d-flex justify-content-between align-items-center">
						<div className="flex-grow-1">
							<div className="d-flex align-items-center ">
								<div
									className="rounded-circle me-2"
									style={{
										width: '8px',
										height: '8px',
										backgroundColor: 'var(--color-primary)',
									}}
								></div>
								<span style={labelStyle} className="fs-5">
									EDIT SESI
								</span>
							</div>
						</div>
						<div className="d-flex gap-2">
							{data && (
								<Button
									variant="light"
									className="rounded-circle p-2 d-flex align-items-center justify-content-center border-0"
									style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
									onClick={() => onToggleHideSession && onToggleHideSession()}
									title={data.isHidden ? 'Tampilkan Sesi' : 'Sembunyikan Sesi'}
								>
									{data.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
								</Button>
							)}
							<Button
								variant="light"
								className="rounded-circle p-2 d-flex align-items-center justify-content-center border-0"
								style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}
								onClick={() => {
									if (window.confirm('Yakin ingin menghapus sesi ini?')) {
										if (onDeleteSession) onDeleteSession();
									}
								}}
								title="Hapus Sesi"
							>
								<Trash2 size={18} />
							</Button>
							<Button
								variant="light"
								className="rounded-circle p-2 d-flex align-items-center justify-content-center border-0"
								style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
								onClick={onClose}
								title="Tutup"
							>
								<X size={18} />
							</Button>
						</div>
					</div>

					{/* Scrollable Body */}
					<div className="flex-grow-1 overflow-auto px-4">
						{/* Judul Sesi */}
						<Form.Group className="mb-3">
							<Form.Label className="form-label required">
								<AlignLeft size={14} className="me-1 required" /> Judul Sesi
							</Form.Label>
							<Form.Control
								type="text"
								name="title"
								value={sessionData.title}
								onChange={handleChange}
								className="form-control shadow-none"
								style={flatInputStyle}
							/>
						</Form.Group>

						{/* Deskripsi */}
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
								className="form-control shadow-none"
								style={{ ...flatInputStyle, resize: 'none' }}
							/>
							<div className="d-flex justify-content-end mt-1">
								<Form.Text className="text-muted small">
									{sessionData.description?.length || 0} / 500 karakter
								</Form.Text>
							</div>
						</Form.Group>

						{/* Hari & Waktu */}
						<Row>
							<Col xs={12} className="mb-3">
								<Form.Label className="form-label required">
									<Calendar size={14} className="me-1" /> Hari
								</Form.Label>
								<Form.Select
									name="dayNumber"
									value={sessionData.dayNumber}
									onChange={handleChange}
									className="form-select shadow-none"
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
										className="form-control shadow-none text-center px-1"
										style={flatInputStyle}
									/>
									<span className="text-muted">-</span>
									<Form.Control
										type="time"
										name="endTime"
										value={sessionData.endTime}
										onChange={handleChange}
										className="form-control shadow-none text-center px-1"
										style={flatInputStyle}
									/>
								</div>
							</Col>
						</Row>

						{/* Prasyarat Sesi */}
						<Form.Group className="mb-3">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<Form.Label className="form-label mb-0">
									<LinkIcon size={14} /> Prasyarat Sesi
								</Form.Label>
								<span className="text-muted" style={{ fontSize: '13px' }}>
									Opsional
								</span>
							</div>
							<Form.Select
								value={sessionData.prerequisite_session_ids?.[0] || ''}
								onChange={handlePrerequisiteChange}
								className="form-select shadow-none"
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
										fontSize: '0.85rem',
									}}
								>
									⚠️ {prerequisiteWarning}
								</div>
							)}
						</Form.Group>

						{/* Pembicara */}
						<div className="mb-4">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<div>
									<Form.Label className="form-label required">
										<Users size={14} /> Pembicara
									</Form.Label>
									{!sessionData.no_speaker && (
										<span
											className="badge rounded-pill bg-light text-primary border ms-1"
											style={{ fontSize: '11px' }}
										>
											{sessionData.speakers?.length || 0}
										</span>
									)}
								</div>
								{!sessionData.no_speaker && (
									<Button
										variant="link"
										className="text-decoration-none p-0 d-flex align-items-center gap-1"
										style={{ fontSize: '0.875rem', fontWeight: 500 }}
										onClick={() => {
											setPrevView('form');
											setActiveView('speaker-list');
										}}
									>
										<Plus size={16} /> Tambah
									</Button>
								)}
							</div>

							<Form.Check
								type="switch"
								id="no-speaker-switch"
								label="Sesi ini tidak memerlukan pembicara"
								checked={sessionData.no_speaker || false}
								onChange={(e) => {
									const val = e.target.checked;
									setSessionData((prev) => ({
										...prev,
										no_speaker: val,
										speakers: val ? [] : prev.speakers,
									}));
								}}
								className="mb-3"
								style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}
							/>

							{sessionData.no_speaker && (
								<div
									className="p-3 text-center border rounded-3 bg-light text-muted"
									style={{ fontSize: '13px', borderStyle: 'dashed' }}
								>
									Sesi ini diatur untuk tidak memiliki pembicara (misalnya: Break,
									Coffee Break, atau Closing tanpa pembicara).
								</div>
							)}

							{/* Speaker Cards */}
							{sessionData.speakers?.map((speaker, index) => (
								<div
									key={speaker.id || index}
									className="border bg-white p-3 mt-3 position-relative speaker-card-hover"
									style={{
										borderRadius: '16px',
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
											fontSize: '12px',
											zIndex: 5,
										}}
										onClick={(e) => {
											e.stopPropagation();
											setSessionData((prev) => ({
												...prev,
												speakers: (prev.speakers || []).filter(
													(s) => s.id !== speaker.id,
												),
											}));
										}}
									>
										Batalkan
									</Button>

									<div className="d-flex align-items-center gap-3">
										<div
											className="position-relative"
											style={{ width: '48px', height: '48px' }}
										>
											<img
												src={getSpeakerAvatar(speaker)}
												alt={speaker.name}
												className="rounded-circle w-100 h-100"
												style={{ objectFit: 'cover' }}
											/>
										</div>
										<div>
											<h6
												className="m-0"
												style={{ fontWeight: 600, color: '#0f172a' }}
											>
												{speaker.name}
											</h6>
											<p
												className="m-0"
												style={{
													fontSize: '0.8rem',
													color: '#64748b',
													lineHeight: 1.4,
												}}
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
					<div
						className="p-3 border-top bg-white d-flex justify-content-center gap-2"
						style={{ borderColor: '#e2e8f0' }}
					>
						<Button
							variant="outline-secondary"
							onClick={onClose}
							style={{
								borderRadius: '12px',
								padding: '12px',
								fontWeight: 500,
								flex: 1,
							}}
						>
							Batal
						</Button>
						<Button
							disabled={!hasChanges()}
							onClick={handleSubmit}
							className="border-0"
							style={{
								backgroundColor: hasChanges() ? 'var(--color-primary)' : '#f1f5f9',
								color: hasChanges() ? '#ffffff' : '#64748b',
								borderRadius: '12px',
								padding: '12px',
								fontWeight: 500,
								flex: 1,
							}}
						>
							{hasChanges() ? 'Simpan Perubahan' : 'Tidak ada perubahan'}
						</Button>
					</div>
				</>
			)}

			{activeView === 'speaker-list' && (
				<SpeakerList
					sessionSpeakers={sessionData.speakers || []}
					onAddSpeaker={handleAddSpeakerLocal}
					onChangeSidebar={(action) => {
						if (action === 'speaker-add') {
							setSelectedSpeakerToEdit(null);
							setPrevView('speaker-list');
							setActiveView('speaker-add');
						} else {
							setActiveView('form');
						}
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
					onChangeSidebar={() => {
						setActiveView(prevView);
					}}
					initialData={selectedSpeakerToEdit}
					onSave={(speakerData) => {
						if (onSaveSpeaker) {
							onSaveSpeaker(speakerData);
						}
						// Update locally as well if it's already added to this session
						setSessionData((prev) => {
							const exists = prev.speakers.some((s) => s.id === speakerData.id);
							if (exists) {
								return {
									...prev,
									speakers: prev.speakers.map((s) =>
										s.id === speakerData.id ? speakerData : s,
									),
								};
							}
							return prev;
						});
						setActiveView(prevView);
					}}
					isModal={true}
				/>
			)}
		</div>
	);
};

export default SessionForm;
