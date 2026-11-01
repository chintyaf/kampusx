import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal, OverlayTrigger, Tooltip, ProgressBar, Badge } from 'react-bootstrap';
import {
	GraduationCap,
	X,
	Plus,
	ArrowRight,
	ArrowLeft,
	Clock,
	Target,
	BookOpen,
	CheckCircle,
	Lightbulb,
	RotateCcw,
} from 'lucide-react';

const defaultStrategies = ['Pomodoro', 'Matikan notifikasi', 'Catat poin penting', 'Musik fokus'];

const phases = [
	{ id: 'forethought', label: 'Forethought', number: 1 },
	{ id: 'performance', label: 'Performance', number: 2 },
	{ id: 'reflection', label: 'Self-Reflection', number: 3 },
];

const ForethoughtModal = ({ moduleId = 1, onComplete }) => {
	const navigate = useNavigate();

	const [isOpen, setIsOpen] = useState(false);
	const [phase, setPhase] = useState('forethought');

	// Forethought states
	const [sessionGoal, setSessionGoal] = useState('');
	const [selectedStrategies, setSelectedStrategies] = useState([]);
	const [customStrategies, setCustomStrategies] = useState([]);
	const [newStrategy, setNewStrategy] = useState('');
	const [estimatedTime, setEstimatedTime] = useState(25);
	const [confidence, setConfidence] = useState(3);

	// Performance states
	const [sessionStartedAt, setSessionStartedAt] = useState(null);
	const [elapsedTime, setElapsedTime] = useState(0);
	const [finalDuration, setFinalDuration] = useState(0);

	// Self-Reflection states
	const [achievement, setAchievement] = useState(3);
	const [understanding, setUnderstanding] = useState('');
	const [difficulties, setDifficulties] = useState('');
	const [nextPlan, setNextPlan] = useState('');

	const allStrategies = [...defaultStrategies, ...customStrategies];

	// Timer: menghitung waktu belajar aktual
	useEffect(() => {
		if (phase !== 'performance' || !sessionStartedAt) return;

		const interval = setInterval(() => {
			setElapsedTime(Date.now() - sessionStartedAt);
		}, 1000);

		return () => clearInterval(interval);
	}, [phase, sessionStartedAt]);

	// Format waktu menjadi HH:MM:SS
	const formatTime = (milliseconds) => {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
	};

	const toggleStrategy = (strategy) => {
		setSelectedStrategies((prev) =>
			prev.includes(strategy)
				? prev.filter((item) => item !== strategy)
				: [...prev, strategy],
		);
	};

	const addCustomStrategy = () => {
		const trimmed = newStrategy.trim();

		if (trimmed && !allStrategies.includes(trimmed)) {
			setCustomStrategies((prev) => [...prev, trimmed]);
			setSelectedStrategies((prev) => [...prev, trimmed]);
			setNewStrategy('');
		}
	};

	const resetSession = () => {
		setPhase('forethought');

		setSessionGoal('');
		setSelectedStrategies([]);
		setCustomStrategies([]);
		setNewStrategy('');
		setEstimatedTime(25);
		setConfidence(3);

		setSessionStartedAt(null);
		setElapsedTime(0);
		setFinalDuration(0);

		setAchievement(3);
		setUnderstanding('');
		setDifficulties('');
		setNextPlan('');
	};

	const handleClose = () => {
		setIsOpen(false);
		resetSession();
	};

	// FORETHOUGHT -> PERFORMANCE
	const handleStartLearning = (e) => {
		e.preventDefault();

		setSessionStartedAt(Date.now());
		setElapsedTime(0);
		setPhase('performance');
	};

	// PERFORMANCE -> SELF-REFLECTION
	const handleFinishLearning = () => {
		const duration = Date.now() - sessionStartedAt;

		setElapsedTime(duration);
		setFinalDuration(duration);
		setPhase('reflection');
	};

	// SELF-REFLECTION -> COMPLETE
	const handleComplete = (e) => {
		e.preventDefault();

		const sessionData = {
			goal: sessionGoal,
			strategies: selectedStrategies,
			estimatedTime,
			confidence,
			actualDuration: Math.floor(finalDuration / 60000),
			achievement,
			understanding,
			difficulties,
			nextPlan,
		};

		onComplete?.(sessionData);

		handleClose();
		navigate(`/learner/modules/${moduleId}`);
	};

	const activePhase = phases.findIndex((item) => item.id === phase);
	const progress = ((activePhase + 1) / phases.length) * 100;

	const actualMinutes = Math.floor(elapsedTime / 60000);
	const estimatedPercentage = Math.min((actualMinutes / estimatedTime) * 100, 100);

	return (
		<>
			{/* Floating Button */}
			<OverlayTrigger placement="left" overlay={<Tooltip>Mulai Sesi Pembelajaran</Tooltip>}>
				<button
					onClick={() => setIsOpen(true)}
					style={{
						position: 'fixed',
						bottom: 28,
						right: 28,
						zIndex: 1050,
						width: 52,
						height: 52,
						borderRadius: '50%',
						border: 'none',
						background: '#005a87',
						color: '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 4px 20px rgba(0,90,135,0.3)',
						cursor: 'pointer',
					}}
				>
					<GraduationCap size={22} />
				</button>
			</OverlayTrigger>

			{/* Main Modal */}
			<Modal
				show={isOpen}
				onHide={handleClose}
				centered
				scrollable
				size="md"
				backdrop="static"
			>
				<Modal.Header
					style={{
						border: 'none',
						padding: '22px 24px 12px',
					}}
				>
					<div className="w-100">
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<h5 className="fw-bold mb-1">
									{phase === 'forethought' && 'Persiapkan Sesi Belajarmu'}
									{phase === 'performance' && 'Sesi Pembelajaran Berlangsung'}
									{phase === 'reflection' && 'Evaluasi Pembelajaran'}
								</h5>

								<small className="text-muted">Self-Regulated Learning</small>
							</div>

							<button
								onClick={handleClose}
								className="btn btn-light btn-sm rounded-circle"
							>
								<X size={18} />
							</button>
						</div>

						{/* Phase Indicator */}
						<div className="d-flex justify-content-between mt-4 mb-2">
							{phases.map((item, index) => (
								<div
									key={item.id}
									className="d-flex align-items-center gap-2"
									style={{ fontSize: 11 }}
								>
									<div
										style={{
											width: 25,
											height: 25,
											borderRadius: '50%',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											background:
												index <= activePhase ? '#005a87' : '#e2e8f0',
											color: index <= activePhase ? '#fff' : '#94a3b8',
											fontWeight: 600,
										}}
									>
										{index < activePhase ? (
											<CheckCircle size={14} />
										) : (
											item.number
										)}
									</div>

									<span
										style={{
											color: index === activePhase ? '#005a87' : '#94a3b8',
											fontWeight: index === activePhase ? 700 : 400,
										}}
									>
										{item.label}
									</span>
								</div>
							))}
						</div>

						<ProgressBar
							now={progress}
							style={{ height: 4, background: '#e2e8f0' }}
							variant="info"
						/>
					</div>
				</Modal.Header>

				<Modal.Body style={{ padding: '16px 24px 24px' }}>
					{/* ================================= */}
					{/* 1. FORETHOUGHT */}
					{/* ================================= */}

					{phase === 'forethought' && (
						<Form onSubmit={handleStartLearning}>
							<div className="mb-3">
								<Form.Label className="fw-semibold small">
									<Target size={15} className="me-2" />
									Target sesi ini
								</Form.Label>

								<Form.Control
									type="text"
									required
									placeholder="Apa yang ingin kamu kuasai?"
									value={sessionGoal}
									onChange={(e) => setSessionGoal(e.target.value)}
									style={{ fontSize: 13, padding: 11 }}
								/>
							</div>

							<div className="mb-3">
								<Form.Label className="fw-semibold small">
									Strategi fokus
								</Form.Label>

								<div className="d-flex flex-wrap gap-2 mb-2">
									{allStrategies.map((strategy) => {
										const active = selectedStrategies.includes(strategy);

										return (
											<button
												type="button"
												key={strategy}
												onClick={() => toggleStrategy(strategy)}
												className="btn btn-sm"
												style={{
													borderRadius: 20,
													fontSize: 11,
													background: active ? '#e0f2fe' : '#fff',
													border: active
														? '1px solid #005a87'
														: '1px solid #e2e8f0',
													color: active ? '#005a87' : '#64748b',
												}}
											>
												{strategy}
											</button>
										);
									})}
								</div>

								<div className="d-flex gap-2">
									<Form.Control
										size="sm"
										placeholder="Tambah strategi sendiri..."
										value={newStrategy}
										onChange={(e) => setNewStrategy(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addCustomStrategy();
											}
										}}
									/>

									<Button variant="light" onClick={addCustomStrategy}>
										<Plus size={16} />
									</Button>
								</div>
							</div>

							<div className="mb-4">
								<div className="d-flex justify-content-between">
									<Form.Label className="fw-semibold small">
										Estimasi waktu belajar
									</Form.Label>

									<span className="small fw-bold" style={{ color: '#005a87' }}>
										{estimatedTime} menit
									</span>
								</div>

								<Form.Range
									min={5}
									max={60}
									step={5}
									value={estimatedTime}
									onChange={(e) => setEstimatedTime(Number(e.target.value))}
								/>

								<div
									className="d-flex justify-content-between text-muted"
									style={{ fontSize: 10 }}
								>
									<span>5 menit</span>
									<span>60 menit</span>
								</div>
							</div>

							<div className="mb-4">
								<Form.Label className="fw-semibold small">
									Tingkat keyakinan
								</Form.Label>

								<div className="d-flex gap-2">
									{[1, 2, 3, 4, 5].map((num) => (
										<button
											type="button"
											key={num}
											onClick={() => setConfidence(num)}
											className="btn flex-fill"
											style={{
												background: confidence === num ? '#e0f2fe' : '#fff',
												color: confidence === num ? '#005a87' : '#94a3b8',
												border:
													confidence === num
														? '1px solid #005a87'
														: '1px solid #e2e8f0',
											}}
										>
											{num}
										</button>
									))}
								</div>

								<div
									className="d-flex justify-content-between text-muted mt-1"
									style={{ fontSize: 10 }}
								>
									<span>Kurang yakin</span>
									<span>Sangat yakin</span>
								</div>
							</div>

							<Button
								type="submit"
								className="w-100 border-0 py-2"
								style={{ background: '#005a87' }}
							>
								Mulai Belajar <ArrowRight size={15} className="ms-2" />
							</Button>
						</Form>
					)}

					{/* ================================= */}
					{/* 2. PERFORMANCE */}
					{/* ================================= */}

					{phase === 'performance' && (
						<div>
							<div className="text-center py-3">
								<div
									className="mx-auto mb-3 d-flex align-items-center justify-content-center"
									style={{
										width: 60,
										height: 60,
										borderRadius: '50%',
										background: '#e0f2fe',
										color: '#005a87',
									}}
								>
									<BookOpen size={27} />
								</div>

								<Badge bg="success" className="mb-2">
									Learning in Progress
								</Badge>

								<h6 className="text-muted fw-normal mb-2">Waktu pembelajaran</h6>

								<h1
									className="fw-bold mb-1"
									style={{
										fontSize: 42,
										color: '#005a87',
										fontVariantNumeric: 'tabular-nums',
									}}
								>
									{formatTime(elapsedTime)}
								</h1>

								<small className="text-muted">Durasi belajar aktual</small>
							</div>

							{/* Learning Goal */}
							<div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc' }}>
								<div className="small text-muted mb-1">
									<Target size={14} className="me-1" />
									Target pembelajaran
								</div>

								<div className="fw-semibold small">{sessionGoal}</div>
							</div>

							{/* Time Comparison */}
							<div className="border rounded-3 p-3 mb-3">
								<div className="d-flex justify-content-between mb-2">
									<span className="small fw-semibold">
										<Clock size={14} className="me-1" />
										Estimasi vs Aktual
									</span>

									<span className="small fw-bold" style={{ color: '#005a87' }}>
										{actualMinutes} / {estimatedTime} menit
									</span>
								</div>

								<ProgressBar now={estimatedPercentage} style={{ height: 8 }} />

								<div
									className="d-flex justify-content-between mt-2 text-muted"
									style={{ fontSize: 10 }}
								>
									<span>Waktu aktual: {actualMinutes} menit</span>
									<span>Target: {estimatedTime} menit</span>
								</div>
							</div>

							{/* Selected Strategies */}
							<div className="mb-4">
								<div className="small fw-semibold mb-2">
									Strategi belajar yang direncanakan
								</div>

								<div className="d-flex flex-wrap gap-2">
									{selectedStrategies.length > 0 ? (
										selectedStrategies.map((strategy) => (
											<Badge
												key={strategy}
												bg="light"
												text="dark"
												className="p-2 fw-normal"
											>
												<CheckCircle
													size={11}
													className="me-1 text-success"
												/>
												{strategy}
											</Badge>
										))
									) : (
										<small className="text-muted">
											Tidak ada strategi khusus.
										</small>
									)}
								</div>
							</div>

							<div className="alert alert-info py-2 small">
								<Lightbulb size={15} className="me-1" />
								Tetap fokus dan pantau perkembangan belajarmu. Waktu akan dihitung
								secara otomatis.
							</div>

							<Button
								onClick={handleFinishLearning}
								className="w-100 border-0 py-2"
								style={{ background: '#005a87' }}
							>
								Selesaikan Sesi <CheckCircle size={15} className="ms-2" />
							</Button>
						</div>
					)}

					{/* ================================= */}
					{/* 3. SELF-REFLECTION */}
					{/* ================================= */}

					{phase === 'reflection' && (
						<Form onSubmit={handleComplete}>
							<div
								className="text-center p-3 rounded-3 mb-4"
								style={{ background: '#f0f9ff' }}
							>
								<CheckCircle
									size={32}
									style={{ color: '#005a87' }}
									className="mb-2"
								/>

								<h6 className="fw-bold mb-1">Sesi pembelajaran selesai!</h6>

								<div className="text-muted small">Waktu belajar aktual</div>

								<h3 className="fw-bold mb-0" style={{ color: '#005a87' }}>
									{formatTime(finalDuration)}
								</h3>
							</div>

							<div className="mb-3">
								<Form.Label className="fw-semibold small">
									1. Seberapa baik target pembelajaran tercapai?
								</Form.Label>

								<div className="d-flex gap-2">
									{[1, 2, 3, 4, 5].map((num) => (
										<button
											type="button"
											key={num}
											onClick={() => setAchievement(num)}
											className="btn flex-fill"
											style={{
												background:
													achievement === num ? '#e0f2fe' : '#fff',
												color: achievement === num ? '#005a87' : '#94a3b8',
												border:
													achievement === num
														? '1px solid #005a87'
														: '1px solid #e2e8f0',
											}}
										>
											{num}
										</button>
									))}
								</div>

								<div
									className="d-flex justify-content-between text-muted mt-1"
									style={{ fontSize: 10 }}
								>
									<span>Belum tercapai</span>
									<span>Sangat tercapai</span>
								</div>
							</div>

							<div className="mb-3">
								<Form.Label className="fw-semibold small">
									2. Apa yang berhasil kamu pahami?
								</Form.Label>

								<Form.Control
									as="textarea"
									rows={2}
									required
									placeholder="Tuliskan pemahaman atau hal baru yang diperoleh..."
									value={understanding}
									onChange={(e) => setUnderstanding(e.target.value)}
									style={{ fontSize: 13 }}
								/>
							</div>

							<div className="mb-3">
								<Form.Label className="fw-semibold small">
									3. Kesulitan apa yang kamu hadapi?
								</Form.Label>

								<Form.Control
									as="textarea"
									rows={2}
									placeholder="Tuliskan kendala selama pembelajaran..."
									value={difficulties}
									onChange={(e) => setDifficulties(e.target.value)}
									style={{ fontSize: 13 }}
								/>
							</div>

							<div className="mb-4">
								<Form.Label className="fw-semibold small">
									4. Apa yang akan kamu lakukan selanjutnya?
								</Form.Label>

								<Form.Control
									as="textarea"
									rows={2}
									placeholder="Contoh: Mengulang materi atau mempelajari topik berikutnya..."
									value={nextPlan}
									onChange={(e) => setNextPlan(e.target.value)}
									style={{ fontSize: 13 }}
								/>
							</div>

							<Button
								type="submit"
								className="w-100 border-0 py-2"
								style={{ background: '#005a87' }}
							>
								Simpan Refleksi <CheckCircle size={15} className="ms-2" />
							</Button>
						</Form>
					)}
				</Modal.Body>
			</Modal>
		</>
	);
};

export default ForethoughtModal;
